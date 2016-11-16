#!/usr/bin/env node
/*
Copyright (c) 2016, Miguel Ortega Moreno <miguel.ortega.moreno5@gmail.com>

Permission to use, copy, modify, and/or distribute this software for any purpose
with or without fee is hereby granted, provided that the above copyright notice
and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND
FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,INDIRECT,
OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE,
DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT,NEGLIGENCE OR OTHER TORTIOUS
ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
*/

// DEPENDENCIES
var phantom = require('phantom');
var program = require('commander');
var connect = require('connect');
var serveStatic = require('serve-static');
var log4js = require('log4js');
var fs = require('fs');

logger = log4js.getLogger('ACC');
loggerConsole = log4js.getLogger('CONSOLE');
logger.setLevel('INFO');
loggerConsole.setLevel('INFO');

// INTERNAL VAR
var sitepage,
phInstnace,
test_url,
failed=0;

var _baseColor = {
  notice: '\x1b[1;34m',
  error: '\x1b[1;31m',
  warning: '\x1b[1;33m',
  pass: '\x1b[1;32m'
};

var COLOR = {
  NOTICE: _baseColor.notice + 'NOTICE\x1b[0m',
  ERROR: _baseColor.error + 'ERROR\x1b[0m',
  WARNING: _baseColor.warning + 'WARNING\x1b[0m',
  PASS: _baseColor.pass + 'PASS\x1b[0m'
};
var ORDER= {
  ERROR:1,
  WARNING: 2,
  NOTICE: 3,
  PASS:4
};

// Program options
program
.version('0.1.0')
.usage('[options] <test_file>')
.option('-p --port <port>','Server port. Default 8080',parseInt)
.option('-t --timeout <timeout>','Waiting time at component finish',parseInt)
.option('-r --root <dir>','Directory root for the server')
.option('-h --host <host>','Host direction')
.option('-o --output <file>','Output file')
.option('--https','Use HTTPS instance of HTTP')
.option('--config <conf_file','Configuration file')
.option ('--skip','Does not print result on console')
.option('--viewport','View port size')
.option('-l --level <level>', 'Output message level')
.option('--wcag2 <wcag2_level>','WCAG2 level: A AA or AAA')
.arguments('<test_file> ')
.action(function(test){test_dir = test;})
.parse(process.argv);

if (program.config){
  program.config = JSON.parse(fs.readFileSync(program.config, 'utf8'));
  for(var property in program.config){
    program[property] = program.config[property];
  }
}
if (typeof test_dir === 'undefined') {
  program.help();
}

if (program.debug){
  logger.setLevel('DEBUG');
  loggerConsole.setLevel('DEBUG');
}

program.host = program.host || 'localhost'; //default host localhost
program.port = program.port || 8080; // default server port 8080
program.protocol = program.https? 'https' : 'http';
program.root = program.root || __dirname;
program.root += program.root[program.root.length-1] == '/'? '':'/';

program.timeout = program.timeout || 0;
program.viewport = program.viewport || '1024x768';

program.level = program.level? program.level.toUpperCase() : 'ERROR';
program.level = ORDER[program.level]?program.level: 'ERROR';

program.wcag2 = program.wcag2 && program.wcag2.match(/^([A]{1,3})$/)?program.wcag2.toUpperCase() : 'AA';

program.viewport = program.viewport.split('x');
program.viewport = {width:program.viewport[0],height:program.viewport[1]};

// Change reference of test file to root.
if (test_dir.indexOf(program.root) === 0){
  test_dir = test_dir.replace(program.root,'');
}

test_dir = program.protocol + '://' + program.host + ':' + program.port + '/' + test_dir;

// MAIN
connect().use(serveStatic(program.root)).listen(program.port, function(){
  logger.info('Server running on ' + program.port + '...');
  var server = this;
  var errors = {ERROR:[],NOTICE:[],WARNING:[],PASS:[]};
  phantom.create().then(function(instance){
    phInstance = instance;
    return instance.createPage();
  }).then(function(page){
    sitepage = page;
    /*
    * This function wraps WebPage.evaluate, and offers the possibility to pass
    * parameters into the webpage function. The PhantomJS issue is here:
    *
    *   http://code.google.com/p/phantomjs/issues/detail?id=132
    *
    * This is from comment #43.
    */
    function evaluate(page, func) {
      var args = [].slice.call(arguments, 2);
      var fn = "function() { return (" + func.toString() + ").apply(this, " + JSON.stringify(args) + ");}";
      return page.evaluate(fn);
    }
    function endConection(){
      logger.info('Closing server and Phantomjs');
      phInstance.exit(1);
      logger.debug('Phantomjs closed');
      server.close(function(){
        logger.debug('Server closed');
        return failed >0?1:0;
      });
    }
    page.viewportSize = program.viewport;
    page.on('onConsoleMessage',function(msg, lineNum, sourceId) {
      var result_split,report;
      if (msg.match(/\[HTMLCS\]/)){
        result_split = msg.split('|');
        report = {
          type: result_split[0].split(" ")[1],
          principle: '[' + result_split[1] + ']',
          tag: result_split[2],
          tag_id: result_split[3],
          error: result_split[4],
          full_tag: result_split[5],
          full_text: msg
        };
        errors[report.type].push(report);
      } else if(msg.match(/\[AXS\]/)){
        result_split = msg.split('|');
        var type = result_split[0].split(" ")[1].toUpperCase();
        if (type !== 'PASS'){
          report = {
            type: type,
            principle: result_split[1],
            tag: '<' + result_split[2] + '>',
            tag_id: result_split[3],
            error: result_split[4],
            full_tag: result_split[5]
          };
        } else {
          report = {
            type:type,
            principle: result_split[1],
            error: result_split[4]
          };
        }
        errors[report.type].push(report);
      }else {
        logger.debug(msg);
      }
    });
    page.on('onLoadFinished',function() {
      page._init = new Date();
      logger.debug('Cargando dependencias para evaluar la usabilidad');
      page.injectJs(__dirname + '/vendor/HTMLCS.js');
      page.injectJs(__dirname + '/vendor/axs_testing.min.js');
      logger.debug('Injectando la espera de tiempo y a que los components esten ready');
      evaluate(page,function(timeout,wcag2){
        document.addEventListener('WebComponentsReady', function(){
          window.setTimeout(function(){
            window.callPhantom({text:'Antes de llamar a las auditorias',type:'DEBUG'});
            window.callPhantom({text:'WCAG2' + wcag2, type:'DEBUG'});
            window.HTMLCS_RUNNER.run('WCAG2' + wcag2);
            var audit = axs.Audit.run();
            audit.forEach(function(item){
              var result = "[AXS] ";
              if (item.result == 'FAIL') {
                result += item.rule.severity; // TYPE
                result += item.rule && item.rule.code ? '|' + item.rule.code + '.' + item.rule.name: '|'; // principle
                result += item.elements.length > 0? '|' + item.elements[0].tagName : '|'; // tag
                result += item.elements.length > 0 && item.elements[0].id? item.elements[0].id: '|'; //tag_id
                result += item.rule && item.rule.heading? '|' + item.rule.heading : '|'; // error
                if (item.elements.length > 0){
                  var outerHTML = item.elements[0].outerHTML;
                  var list = "";
                  if (item.rule.name == 'lowContrastElements') {
                    var splited = outerHTML.split('\n');
                    list = splited.join('\n     ');
                  } else {
                    outerHTML = outerHTML.replace(/<!--[\s\S]*?-->/g,"");
                    outerHTML = outerHTML.split('>');
                    list = outerHTML[0] + ">";
                    list += outerHTML.length > 1 ? outerHTML[1] + '>':'';
                    list += outerHTML.length > 2 ? outerHTML[2] + '>':'';
                    var close = list.split('>').reverse();
                    close.splice(0,1);
                    close = close.join('>') + '>';
                    close = close.replace(/</g,'</');
                    list = list + close;
                  }
                  result += '|' + list;
                }
                console.log(result);
              } else if (item.result == 'PASS'){
                result += item.result;
                result += item.elements.length > 0? '|' + item.elements[0].tagName : '|'; // tag
                result += item.rule.code + '.' + item.rule.name;
                result += '||';
                result += '|' + item.rule.heading;
                console.log(result);
              }
            });
            window.callPhantom({type:'ACCESSIBILITY_AUDIT'});
            window.callPhantom({type:'CLOSE'});
          },timeout);
        },false);
      },program.timeout, program.wcag2);
    });
    page.on('onCallback',function(msg) {
      function print(item){
        if (ORDER[item.type] <= ORDER[program.level]){
          failed++;
          if (item.type !== 'PASS'){
            console.log('\t',COLOR[item.type]);
            console.log('\t\t',item.principle);
            console.log('\t\t',item.tag, ' ', item.tag_id);
            console.log('\t\t',item.error);
            console.log('\t\t',item.full_tag,'\n');
          } else if (item.type ==='PASS'){
            console.log('\t',COLOR[item.type]);
            console.log('\t\t',item.principle);
            console.log('\t\t',item.error);
          }
        }
      }
      switch (msg.type) {
        case 'ACCESSIBILITY_AUDIT':
        logger.debug('Tiempo ejecución: ', new Date() - page._init);
        if (!program.skip){
          console.log('ACCESSIBILITY REPORT');
          console.log('-----------------------------------------\n');
          for (var type in errors){
            if (errors.hasOwnProperty(type)){
              errors[type].forEach(print);
            }
          }
          var report ="(" + _baseColor.error + errors.ERROR.length + '\x1b[0m/';
          report+= _baseColor.warning + errors.WARNING.length + '\x1b[0m/';
          report+= _baseColor.notice + errors.NOTICE.length + '\x1b[0m/';
          report+= _baseColor.pass + errors.PASS.length + '\x1b[0m)';
          console.log('FINAL REPORT' + report + '\n');
        }
        break;
        case 'CLOSE':
        if (program.output){
          fs.writeFile(program.output,JSON.stringify(errors, null, 2),function(err){
            if(err)logger.error('Trying to write output file',err);
            logger.info('Generate report: ',program.output);
            endConection(failed);
          });
        } else {
          endConection(failed);
        }
        break;
        default:
        logger.debug(msg.text);
        break;
      }
    });
    logger.info('Open ', test_dir);

    return page.open(test_dir);
  });
});

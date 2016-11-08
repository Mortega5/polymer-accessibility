#!/usr/bin/env node
// DEPENDENCIES
var phantom = require('phantom');
var program = require('commander');
var connect = require('connect');
var serveStatic = require('serve-static');

// INTERNAL var
var sitepage,
phInstnace,
test_url;

var _baseColor = {
  notice: '\x1b[1;34m',
  error: '\x1b[1;31m',
  warning: '\x1b[1;33m',
};

var COLOR = {
  NOTICE: _baseColor.notice + 'NOTICE\x1b[0m',
  ERROR: _baseColor.error + 'ERROR\x1b[0m',
  WARNING: _baseColor.warning + 'WARNING\x1b[0m'
};
var ORDER= {
  ERROR:1,
  WARNING: 2,
  NOTICE: 3
};
// Program options
program
.version('0.1.0')
.usage('[options] <test_file>')
.option('-p --port <port>','Server port. Default 8080',parseInt)
.option('-t --timeout <timeout>','Waiting time at component finish',parseInt)
.option('-r --root <dir>','Directory root for the server')
.option('-h --host <host>','Host direction')
.option('--https','Use HTTPS instance of HTTP')
.arguments('<test_file> ')
.action(function(test){test_dir = test;})
.parse(process.argv);

if (typeof test_dir === 'undefined') {
  program.help();
}

program.host = program.host || 'localhost'; //default host localhost
program.port = program.port || 8080; // default server port 8080
program.protocol = program.https? 'https' : 'http';
program.root = program.root || __dirname;
program.root += program.root[program.root.length-1] == '/'? '':'/';

// Change reference of test file to root.
if (test_dir.indexOf(program.root) === 0){
  test_dir = test_dir.replace(program.root,'');
}

test_dir = program.protocol + '://' + program.host + ':' + program.port + '/' + test_dir;

connect().use(serveStatic(program.root)).listen(program.port,function(){
  console.log('Server running on ' + program.port + '...');
  // MAIN
  var server = this;
  var errors = {ERROR:[],NOTICE:[],WARNING:[]};
  phantom.create().then(function(instance){
    phInstance = instance;
    return instance.createPage();
  }).then(function(page){
    sitepage = page;
    page.on('onConsoleMessage',function(msg, lineNum, sourceId) {
      if (msg.match(/\[HTMLCS\]/)){
        var result_split = msg.split('|');
        var error = {
          type: result_split[0].split(" ")[1],
          principle: result_split[1],
          tag: result_split[2],
          tag_id: result_split[3],
          error: result_split[4],
          full_tag: result_split[5],
          full_text: msg
        };
        errors[error.type].push(error);
      }
    });

    page.on('onInitialized',function() {
      page.injectJs('./HTML_CodeSniffer/build/HTMLCS.js');
      page.evaluate(function(domContentLoadedMsg) {
        document.addEventListener('WebComponentsReady', function() {

          window.HTMLCS_RUNNER.run('WCAG2AA');
          window.callPhantom(window);
        }, false);
      });
    });

    page.on('onCallback',function(window) {
      console.log('\nACCESSIBILITY REPORT');
      console.log('-----------------------------------------\n');
      function print(item){
        console.log('\t',COLOR[item.type]);
        console.log('\t\t',item.principle);
        console.log('\t\t',item.tag, ' ', item.tag_id);
        console.log('\t\t',item.error);
        console.log('\t\t',item.full_tag,'\n');
      }
      for (var type in errors){
        if (errors.hasOwnProperty(type)){
          errors[type].forEach(print);
        }
      }
      var report ="(" + _baseColor.error + errors.ERROR.length + '\x1b[0m/';
      report+= _baseColor.warning + errors.WARNING.length + '\x1b[0m/';
      report+= _baseColor.notice + errors.NOTICE.length + '\x1b[0m)';
      console.log('FINAL REPORT' + report)
      // ¿ORDEN?
      phInstance.exit();
      server.close();
    });
    console.log('Open ', test_dir);
    return page.open(test_dir);
  });
});

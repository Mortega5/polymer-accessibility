#!/usr/bin/env phantomjs
var page = require('webpage').create();
var program = require('commander');

page.onConsoleMessage = function(msg, lineNum, sourceId) {
  if (msg.match(/\[HTMLCS\]/)){

  }
};

page.onInitialized = function() {
  page.injectJs('./HTML_CodeSniffer/build/HTMLCS.js');
  page.evaluate(function(domContentLoadedMsg) {
    document.addEventListener('WebComponentsReady', function() {
      window.HTMLCS_RUNNER.run('WCAG2AA');
      window.callPhantom(window);
    }, false);
  });
};

page.onCallback = function(window) {
  phantom.exit(0);
};

page.open('http://localhost:8080/traffic-incidents/demo/index.html');

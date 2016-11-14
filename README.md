# POLYMER ACCESSIBILITY TOOL

Web component accessibility evaluation tool. It use
[accessibility-developer-tools](https://github.com/GoogleChrome/accessibility-developer-tools)
and [HTML_CodeSniffer](https://github.com/squizlabs/HTML_CodeSniffer).

## USAGE

Usage: acc [options] <test_file>
```pre
Options:

  -h, --help              output usage information
  -V, --version           output the version number
  -p --port <port>        Server port. Default 8080
  -t --timeout <timeout>  Waiting time at component finish
  -r --root <dir>         Directory root for the server
  -h --host <host>        Host direction
  -o --output <file>      Output file
  --verbose               Show passed test
  --https                 Use HTTPS instance of HTTP
  --config <conf_file     Configuration file
  --skip                  Does not print result on console
  --viewport              View port size
```

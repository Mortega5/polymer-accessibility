# POLYMER ACCESSIBILITY TOOL

Web component accessibility evaluation tool. It use
[accessibility-developer-tools](https://github.com/GoogleChrome/accessibility-developer-tools)
and [HTML_CodeSniffer](https://github.com/squizlabs/HTML_CodeSniffer).

## USAGE
```pre
Usage: acc [options] <test_file>
       acc [options] --config config_file.json

Options:

  -h, --help                   output usage information
  -V, --version                output the version number
  -p --port <port>             Server port. Default 8080
  -t --timeout <timeout>       Waiting time at component finish
  -r --root <dir>              Directory root for the server
  -h --host <host>             Host direction
  -o --output <file>           Output file
  --https                      Use HTTPS instance of HTTP
  --config <conf_file>         Configuration file
  --skip                       Does not print result on console
  --brief                      Brief report
  --viewport                   View port size
  --log <level>                Output message level
  --wcag2 <wcag2_level>        WCAG2 level: A AA or AAA
  -l --list <list_components>  List of index
  --skip_errors                Skip console errors

```

### Example of config file

```json
{
  "port": 8081,
  "timeout": 3000,
  "output": "output.json",
  "verbose": false,
  "skip_errors":true,
  "brief":true,
  "log":"ERROR",
  "components": [ // List of components that will be analyzed
    "traffic-incidents-stable/demo/index.html",
    "twitter-timeline-stable/static/demo.html",
    "facebook-wall-stable/demo.html",
    "googleplus-timeline-stable/demo/index.html",
    "pinterest-timeline-stable/demo/index.html",
    "open-weather-stable/demo/index.html",
    "finance-search-stable/demo/index.html",
    "traffic-incidents-stable/demo/index.html"
  ],
  "root":"bower_components"
}
```
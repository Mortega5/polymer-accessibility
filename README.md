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
## Config file optios

| Parametro        | Descripcion                               | Default   |
|:----------------:|-------------------------------------------|----------:|
| *port*           | Server port                               | 8080      |
| *timeout*        | Delay before to execute test              | 0         |
| *root*           | Root folder where server will be deployed | .         |
| *host*           | Server host                               | localhost |
| *output*         | Output file where results will be stored  |           |
| *verbose*        | Show all the output information           | true      |
| *brief*          | Only display test results                 | false     |
| *wcag2*          | Enable/disable wcag2 test                 | true      |
| *wcag2_level*    | Set wcag2 test level (A, AA or AAA)       | AA        |
| *a11y*           | Enable/disable a11y test                  | true      |
| *skip_errors*    | HTML errors will not displayed            | false     |
| *log*            | Set log level (error,info, debug)         | info      |
| *components*     | List of components that will be  tested   |           |
| *mixpanel_token* | Send data to mixpanel using this token    |           |
| *nomixpanel*     | Avoid send data to mixpanel               | false     |

### Example of config file

```json
{
  "port": 8081,
  "timeout": 3000,
  "output": "resultado.json",
  "verbose": false,
  "skip_errors":true,
  "wcag2":false,
  "a11y":true,
  "brief":true,
  "nomixpanel":true,
  "log":"DEBUG",
  "components": [
    "traffic-incidents-stable/demo/index.html"
  ],
  "root":"bower_components",
  "mixpanel_token":"5545dfs25482dhwh324s"
}
```
# phantom-promise

A [PhantomJS](http://phantomjs.org/) bridge with a promise based api.

[![npm version](https://img.shields.io/npm/v/phantom-promise.svg)](https://www.npmjs.com/package/phantom-promise)
[![Travis](https://img.shields.io/travis/panosoft/phantom-promise.svg)](https://travis-ci.org/panosoft/phantom-promise)

## Installation

```sh
npm install phantom-promise
```

## Usage

```js
var Phantom = require('phantom-promise');

var phantom = Phantom.create();
phantom.initialize()
  .then(() => phantom.createPage())
  .then((page) => {
    var pageFunction = function () {
      var result = 'Hello from Phantom.';
      window.callPhantom(result);
    };
    return page.evaluate(pageFunction);
  })
  .then((result) => {
    console.log(result); //=> Hello from Phantom.
    phantom.shutdown();
  });
```

## API

__Phantom__

- [`create`](#create)
- [`createPage`](#createPage)
- [`initialize`](#initialize)
- [`shutdown`](#shutdown)

__Page__

- [`close`](#close)
- [`evaluate`](#evaluate)
- [`get`](#get)
- [`injectJs`](#injectJs)
- [`set`](#set)

---

### Phantom

<a name="create"></a>
#### create ( )

Returns an instance of `Phantom`.

__Example__

```js
var Phantom = require('phantom-promise');

var phantom = Phantom.create();
```

---

<a name="createPage"></a>
#### createPage ( )

Creates a [Web Page](http://phantomjs.org/api/webpage/) in PhantomJs. Returns a `Promise` that is fulfilled with an instance of `Page`.

__Example__

```js
phantom.createPage()
  .then((page) => {
    // ...
  })
```

---

<a name="initialize"></a>
#### initialize ( )

Initializes the `Phantom` instance. Returns a `Promise` that is fulfilled once the initialization is complete.

This must be called before the instance can be used.

__Example__

```js
phantom.initialize()
  .then(() => {
    // ...
  });
```

---

<a name="shutdown"></a>
#### shutdown ( )

Shuts down the phantom instance. Once this has been called, the instance is no longer operable unless it is re-initialized.

__Example__

```js
phantom.shutdown();
```

---

### Page

<a name="close"></a>
#### close ( )

Closes the page. Once this has been called, the page instance can no longer be used.

__Example__

```js
page.close();
```

---

<a name="evaluate"></a>
#### evaluate ( fn [,arg] )

Evaluates a function on the page. Returns a `Promise` that is fulfilled with the return value of the function.

__Arguments__

- `fn` - The function to evaluate on the page. This function must call `window.callPhantom(result)` in order to return.
- `arg` - An argument to evaluate `fn` with. This argument must be JSON-serializable (i.e. Closures, functions, DOM nodes, etc. will not work!).

__Example__

```js
var pageFunction = function (arg) {
  window.callPhantom(arg);
};

var arg = 'Hello from Phantom.';
page.evaluate(pageFunction, arg)
  .then((result) => {
    console.log(result); //=> 'Hello from Phantom.'
  });
```

---

<a name="get"></a>
#### get ( property )

Returns a Promise that is fulfilled with the requested page property.

__Arguments__

- `property` - A string determining the property to return.

__Example__

```js
page.get('viewportSize')
  .then((viewportSize) => {
    // ...
  });
```

---

<a name="injectJs"></a>
#### injectJs ( paths )

Injects external scripts into the page. The scripts are loaded in the order they are supplied so that dependencies can be met.

__Arguments__

- `paths` - A path or an array of paths to the script files to be injected.

__Example__

```js
page.injectJs('path/to/external/script.js');
```

---

<a name="set"></a>
#### set ( property , value )

Sets a page property. Returns a promise that is fulfilled with the result.

__Arguments__

- `property` - A string determining the property to set.
- `value` - The value to apply.

__Example__

```js
page.set('viewportSize', {height: 768, width: 1024});
```

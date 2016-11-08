var Phantom = require('../');
var expect = require('chai')
	.use(require('chai-as-promised'))
	.expect;
var path = require('path');

describe('Phantom', function () {
	var phantom;
	describe('create', function () {
		it('return an instance of Phantom', function () {
			phantom = Phantom.create();
			expect(phantom).to.include.all.keys(['initialize', 'createPage', 'shutdown']);
		});
	});
	describe('initialize', function () {
		it('makes phantom instance ready to use', function () {
			return expect(phantom.initialize()).to.eventually.be.fulfilled;
		});
		it('throw if already initialized', function () {
			return expect(phantom.initialize()).to.eventually.be.rejectedWith(Error, /Already initialized/);
		});
	});
	describe('shutdown', function () {
		it('disable instance', function () {
			phantom.shutdown();
			return expect(phantom.createPage()).to.eventually.be.rejectedWith(Error, /Not initialized/);
		});
		it('throw if not initialized', function () {
			expect(phantom.shutdown).to.throw(Error, /Not initialized/);
		});
	});
});

describe('Page', function () {
	var phantom = Phantom.create();
	var page;
	before(function () {
		return phantom.initialize();
	});
	after(function () {
		phantom.shutdown();
	});
	describe('phantom.createPage', function () {
		it('return Promise fulfilled with page', function () {
			return phantom.createPage()
				.then(function (pg) {
					page = pg;
					expect(page).to.include.all.keys(['close', 'evaluate', 'get', 'injectJs', 'set']);
				});
		});
	});
	describe('get', function () {
		it('return Promise fulfilled with property', function () {
			return expect(page.get('viewportSize')).to.eventually.be.an('object');
		});
	});
	describe('set', function () {
		it('set property', function () {
			var size = { height: 1, width: 1 };
			page.set('viewportSize', size);
			return expect(page.get('viewportSize')).to.eventually.deep.equal(size);
		});
	});
	describe('evaluate', function () {
		it('evaluate a function on the page', function () {
			var test = function () {
				window.callPhantom(true);
			};
			return expect(page.evaluate(test)).to.eventually.be.true;
		});
		it('pass a single argument to the function being evaluated', function () {
			var test = function (result) {
				window.callPhantom(result);
			};
			return expect(page.evaluate(test, true)).to.eventually.be.true;
		});
		it('throw if js error on page', function () {
			var test = function () { a; };
			return expect(page.evaluate(test)).to.eventually.be.rejectedWith(/ReferenceError/);
		});
	});
	describe('injectJs', function () {
		var two = path.resolve(__dirname, 'fixtures/two.js');
		var four = path.resolve(__dirname, 'fixtures/four.js');
		var page;
		beforeEach(function () {
			return phantom.createPage()
				.then(function (pg) {
					page = pg;
				});
		});
		afterEach(function () {
			page.close();
		});
		it('inject js file', function () {
			return page.injectJs(two)
				.then(function () {
					var test = function () { window.callPhantom(two); };
					return expect(page.evaluate(test)).to.eventually.equal(2);
				});
		});
		it('inject js files in order', function () {
			return page.injectJs([two, four])
				.then(function () {
					var test = function () { window.callPhantom(four);};
					return expect(page.evaluate(test)).to.eventually.equal(4);
				});
		});
	});
	describe('close', function () {
		it('close page', function () {
			page.close();
		});
	});
});

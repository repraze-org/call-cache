# call-cache
A simple in-memory function call caching for node.js feeding a callback

* Speedup the generation of pages by storing external API calls
* Works great with **async** for multiple calls by feeding the final callback
* Prevent reaching limits using external APIs

## Installation

    npm install call-cache

## Usage

```javascript
var options = {debug: true};
var cache = require('call-cache')(options);

// using the cache

cache.get('foo',
	function(callback){	// generating the cache
		console.log('Fetching Foo');
		callback('foo');
	},
	function(result){	// callback, always called
		console.log('Retrieved '+result);
	}
);
```

Should output:

    Cache: foo - Getting data, next time in 300000 //debug
    Fetching Foo
    Retrieved Foo

## API

### get : function(key, generator, callback, [options])

* Calls the generator function and pass the callback function if there is no cache for the specified key
* Calls callback directly with any n cached arguments passed by the generator function
* Optional options can be provided to overwrite global ones

### del : function(key)

* Deletes cache for a provided key
* Simple mapping to the del function of memory-cache

### clear : function()

* Empties the cache
* Simple mapping to the clear function of memory-cache

## Options

Options can be defined when creating the cache after requiring it and can be overwritten by passing options to the method calls directly.

### time
Amount of time before the cache expires in ms. Upon next call, the generator function will be called again. Default to `1000*60*5` (5 mins)

### debug
When set to `true` enables debuging. Default to `false`

## Usage with async

Here is a more advanced example using [async](https://www.npmjs.com/package/async)

```javascript
var cache = require('call-cache')({debug: true});
var async = require('async');

// using the cache

cache.get('foobar',
	function(callback){	// generating the cache
		async.parallel({
			foo: function(callback){
				setTimeout(function () {
					callback(null, 'foo');	// in async, the first argument is for errors
				}, 100);
			},
			bar: function(callback){
				setTimeout(function () {
					callback(null, 'bar');
				}, 200);
			},
		},
		callback);	// feeding the callback here
		console.log('Fetching Foo and Bar');
	},
	function(err, result){	// callback, always called
		console.log(
			'Retrieved '+result.foo,
			'Retrieved '+result.bar
		);
	}
);
```

Should output:

    Cache: foobar - Getting data, next time in 300000 //debug
    Fetching Foo and Bar
    Retrieved foo Retrieved bar

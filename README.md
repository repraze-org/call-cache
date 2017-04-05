# call-cache
A simple in-memory function call caching for node.js feeding a callback and returning a Promise

* Speedup the generation of pages by storing external API calls
* Works great with **async** for multiple calls by feeding the final callback
* Compatible with **Promises** to use with the latest APIs
* Prevent reaching limits using external APIs

## Installation

    npm install call-cache

## Usage

```javascript
var options = {debug: true};
var cache = require('call-cache')(options);

// using the cache

cache.get('foo',
    function(){         // generating the cache
        console.log('Fetching Foo');
        return 'Foo';
    },
    function(result){   // callback, always called
        console.log('Retrieved '+result);
    }
);

// using the cache with generator callback, useful for asynchronous code

cache.get('bar',
    function(callback){     // generating the cache
        console.log('Fetching Bar');
        callback('Bar');    // can have any number of parameters
    },
    function(result){       // callback, always called
        console.log('Retrieved '+result);
    }
);

// using the cache with Promises

cache.get('baz',
    function(callback){     // generating the cache
        console.log('Fetching Baz');
        callback('Baz');    // promise will get the first parameter
    }
).then(function(result){          // promise style, always called
    console.log('Retrieved '+result);
});
```

Should output (order might change):

    Cache: foo - Getting data, next time in 300000 //debug
    Fetching Foo
    Retrieved Foo
    Cache: bar - Getting data, next time in 300000 //debug
    Fetching Bar
    Retrieved Bar
    Cache: baz - Getting data, next time in 300000 //debug
    Fetching Baz
    Retrieved Baz

## API

### get : function(key, generator, [callback, options])

* Calls the generator function and pass the callback function when needed if there is no cache for the specified key
* Generator functions not requiring a callback can simply return a value that will be passed to the callback
* Calls callback directly with any n cached arguments passed by the generator function
* Callback is optional to only define periodical functions
* Optional options can be provided to overwrite global ones
* Returns a Promise resolving what is returned as a value or Promise, or the first argument sent to the callback, from the generator

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
    function(callback){    // generating the cache
        async.parallel({
            foo: function(callback){
                setTimeout(function () {
                    callback(null, 'foo');    // in async, the first argument is for errors
                }, 100);
            },
            bar: function(callback){
                setTimeout(function () {
                    callback(null, 'bar');
                }, 200);
            },
        },
        callback);    // feeding the callback here
        console.log('Fetching Foo and Bar');
    },
    function(err, result){    // callback, always called
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

## Usage with Promises

```javascript
var cache = require('call-cache')({debug: true});
var async = require('async');

// using the cache

cache.get('foobar',
    function(){    // generating the cache
        console.log('Fetching Foo and Bar');
        return Promise.all([ // allows multiple Promises
            new Promise(function(res, rej){
                setTimeout(function(){
                    res('foo');
                }, 100);
            }),
            new Promise(function(res, rej){
                setTimeout(function(){
                    res('bar');
                }, 200);
            })
        ]);
    }
).then(function(result){
    console.log(
        'Retrieved '+result[0],
        'Retrieved '+result[1]
    );
});
```

Should output:

    Cache: foobar - Getting data, next time in 300000 //debug
    Fetching Foo and Bar
    Retrieved foo Retrieved bar

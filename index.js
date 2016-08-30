'use strict';

var cache = require("memory-cache");
var objectAssign = require('object-assign');

module.exports = function(options){
    var globalOptions = objectAssign({
        time        : 1000*60*5,// default time of 5 minutes
        autoUpdate  : false,    // should update automaticaly after expire
        debug       : false     // enable debug
    }, options);

    return {
        get : function(key, generator, callback, options){
            if(typeof key !== 'string' && !(key instanceof String)){
                throw new Error('Cache key must be a string');
            }
            if(typeof generator !== 'function'){
                throw new Error('Cache generator must be a function');
            }
            if(typeof callback !== 'undefined' && typeof callback !== 'function'){
                throw new Error('Cache callback must be a function');
            }

            if(!isNaN(parseFloat(options))){
                options = {
                    time : options
                }
            }
            options = objectAssign(globalOptions, options);

            var args = cache.get(key);
            if(args === null){
                if(options.debug){
                    console.log("Cache: "+key+" - Getting data, next time in "+options.time);
                }
                if(generator){
                    var cacher = function(){
                        cache.put(key, arguments, options.time);
                        if(callback){
                            callback.apply(null, arguments);
                        }
                    }

                    if(generator.length > 0){
                        generator(cacher);
                    }else{
                        cacher(generator());
                    }
                }
            }else{
                if(options.debug){
                    console.log("Cache: "+key+" - Using cached data");
                }

                if(callback){
                    callback.apply(null, args);
                }
            }
        },
        del : function(key){
            return cache.del(key);
        },
        clear : function(){
            return cache.clear();
        }
    }
}

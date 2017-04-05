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
                if(typeof options !== 'undefined'){
                    throw new Error('Cache callback must be a function');
                }else{
                    options = callback;
                    callback = undefined;
                }
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
                    };

                    if(generator.length > 0){
                        return new Promise(function(res, rej){
                            var resolver = function(){
                                cacher.apply(null, arguments);
                                res(arguments[0]);
                            };
                            generator(resolver);
                        });
                    }else{
                        try{
                            var prom = Promise.resolve(generator());
                            prom.then(function(args){
                                cacher(args);
                            }).catch(function(e){
                                if(callback){
                                    callback(e);
                                }
                            });
                            return prom;
                        }catch(e){
                            if(callback){
                                callback(e);
                            }
                            return Promise.reject(e);
                        }
                    }
                }
            }else{
                if(options.debug){
                    console.log("Cache: "+key+" - Using cached data");
                }

                if(callback){
                    callback.apply(null, args);
                }
                return Promise.resolve(args[0]);
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

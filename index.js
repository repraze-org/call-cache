'use strict';

var cache = require("memory-cache");
const objectAssign = require('object-assign');

module.exports = function(options){
	var globalOptions = objectAssign({
		time		: 1000*60*5,// default time of 5 minutes
		autoUpdate	: false,	// should update automaticaly after expire
		debug		: false		// enable debug
	}, options);

	return {
		get : function(key, generator, callback, options){
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
				if(generator instanceof Function){
					var cacher = function(){
						cache.put(key, arguments, options.time);
						callback.apply(null, arguments);
					}
					generator(cacher);
				}
			}else{
				if(options.debug){
					console.log("Cache: "+key+" - Using cached data");
				}
				if(callback instanceof Function){
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

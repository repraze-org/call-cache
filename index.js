'use strict';

var cache = require("memory-cache");

module.exports = function(options){
	var globalOptions = Object.assign({
		time		: 1000*60*5,// default time of 5 minutes
		autoUpdate	: false,	// should update automaticaly after expire
		debug		: false		// enable debug
	}, options);

	return {
		get : function(id, generator, callback, options){
			if(!isNaN(parseFloat(options))){
				options = {
					time : options
				}
			}
			options = Object.asign(globalOptions, options);
			var time = time || options.defaultTime;

			var args = cache.get(id);
			if(args === null){
				if(options.debug){
					console.log("Cache: "+id+" - Getting data, next time in "+options.time);
				}
				if(generator instanceof Function){
					var cacher = function(){
						cache.put(id, arguments, options.time);
						callback.apply(null, arguments);
					}
					generator(cacher);
				}
			}else{
				if(options.debug){
					console.log("Cache: "+id+" - Using cached data");
				}
				if(callback instanceof Function){
					callback.apply(null, args);
				}
			}
		},
		del : function(id){
			cache.del(id);
		},
		clear : function(){
			cache.clear();
		}
	}
}

'use strict';

var chai    = require('chai'),
    expect  = chai.expect,
    cache   = require('./index')();

describe('call-cache', function() {
    describe('get', function(){
        it('should throw an error if no parameter is given', function(){
            expect(function() {
                cache.get();
            }).to.throw();
        });

        it('should throw an error if no key is not a string', function(){
            expect(function() {
                cache.get(null, function(){}, function(){});
            }).to.throw();
            expect(function() {
                cache.get(0, function(){}, function(){});
            }).to.throw();
            expect(function() {
                cache.get("key", function(){}, function(){});
            }).to.not.throw();
        });
    });
});

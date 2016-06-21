'use strict';

var chai    = require('chai'),
    expect  = chai.expect,
    cache   = require('./index')();

describe('call-cache', function() {
    describe('get', function(){
        beforeEach(function() {
            cache.clear();
        });

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
                cache.get('key', function(){}, function(){});
            }).to.not.throw();
        });

        it('should throw an error if generator is not defined or a function', function(){
            expect(function() {
                cache.get('key');
            }).to.throw();
            expect(function() {
                cache.get('key', null);
            }).to.throw();
            expect(function() {
                cache.get('key', 0);
            }).to.throw();
            expect(function() {
                cache.get('key', function(){});
            }).to.not.throw();
        });

        it('should throw an error if callback is defined and not a function', function(){
            expect(function() {
                cache.get('key', function(){}, 0);
            }).to.throw();
            expect(function() {
                cache.get('key', function(){}, null);
            }).to.throw();
            expect(function() {
                cache.get('key', function(){}, "string");
            }).to.throw();
            expect(function() {
                cache.get('key', function(){}, function(){});
            }).to.not.throw();
        });

        it('should generate arguments and send them to callback', function(){
            var obj = {foo: 10};
            var tests = [
                {args: [10],                 expected: [10]},
                {args: ["string"],           expected: ["string"]},
                {args: [ obj],               expected: [ obj]},
                {args: [10, "string",  obj], expected: [10, "string",  obj]},
            ];

            tests.forEach(function(test){
                cache.get('key', function(callback){
                    callback.apply(null, test.args);
                }, function(){
                    for(var i = 0; i < arguments.length; i++){
                        expect(arguments[i]).to.equal(test.expected[i]);
                    }
                    cache.clear();
                });
            });
        });

        it('should regenerate only after timeout', function(done){
            var i = 0;
            var exec = function(assertion){
                cache.get('key', function(callback){
                    i++;
                    callback(i);
                }, function(val){
                    assertion(val)
                }, 10);
            }

            exec(function(val){expect(val).to.equal(1);});

            setTimeout(function () {
                exec(function(val){expect(val).to.equal(1);});
            }, 9);

            setTimeout(function () {
                exec(function(val){
                    expect(val).to.equal(2);
                    done();
                });
            }, 30);
        });
    });

    describe('del', function(){
        beforeEach(function() {
            cache.clear();
        });

        it('should return false for a key to an empty cache', function(){
            expect(cache.del('empty')).to.be.false;
        });

        it('should return false given a key not in a non-empty cache', function(){
            cache.get('key', function(callback){callback()}, function(){
                expect(cache.del('miss')).to.be.false;
            });
        });

        it('should return true given a key for an existing cache', function(){
            cache.get('key', function(callback){callback()}, function(){
                expect(cache.del('key')).to.be.true;
            });
        });

        it('should force cache to regenerate', function(){
            var i = 0;
            var exec = function(assertion){
                cache.get('key', function(callback){
                    i++;
                    callback(i);
                }, function(val){
                    assertion(val)
                }, 10);
            }

            exec(function(val){
                expect(val).to.equal(1);
                cache.del('key');
                exec(function(val){
                    expect(val).to.equal(2);
                    cache.del('key');
                });
            });
        });
    });

    describe('clear', function(){    
        it('should clear all existing cache', function(){
            cache.get('key1', function(callback){callback()}, function(){
                cache.get('key2', function(callback){callback()}, function(){
                    cache.clear();

                    expect(cache.del('key1')).to.be.false;
                    expect(cache.del('key2')).to.be.false;
                });
            });
        });
    });
});

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

        it('should throw an error if callback is defined and not a function while options is defined', function(){
            expect(function() {
                cache.get('key', function(){}, 0);
            }).to.not.throw();
            expect(function() {
                cache.get('key', function(){}, 0, 1000);
            }).to.throw();
            expect(function() {
                cache.get('key', function(){}, null);
            }).to.not.throw();
            expect(function() {
                cache.get('key', function(){}, null, 1000);
            }).to.throw();
            expect(function() {
                cache.get('key', function(){}, "string");
            }).to.not.throw();
            expect(function() {
                cache.get('key', function(){}, "string", 1000);
            }).to.throw();
            expect(function() {
                cache.get('key', function(){}, function(){});
            }).to.not.throw();
            expect(function() {
                cache.get('key', function(){}, function(){}, 1000);
            }).to.not.throw();
        });

        it('should generate arguments and return them to callback directly', function(done){
            var obj = {foo: 10};
            var tests = [
                {val: 10,       expected: 10},
                {val: "string", expected: "string"},
                {val:  obj,     expected:  obj},
            ];
            var doneN = 0;

            tests.forEach(function(test, i){
                cache.get('key'+i, function(){
                    return test.val;
                }, function(val){
                    try{
                        expect(val).to.equal(test.expected);
                    }catch(e){
                        return done(e);
                    }
                });
                if(++doneN === tests.length){
                    done();
                }
            });
        });

        it('should generate arguments and send them to given callback', function(done){
            var obj = {foo: 10};
            var tests = [
                {args: [10],                 expected: [10]},
                {args: ["string"],           expected: ["string"]},
                {args: [ obj],               expected: [ obj]},
                {args: [10, "string",  obj], expected: [10, "string",  obj]}
            ];
            var doneN = 0;

            tests.forEach(function(test, i){
                cache.get('key'+i, function(callback){
                    callback.apply(null, test.args);
                }, function(){
                    for(var j = 0; j < test.expected.length; ++j){
                        try{
                            expect(arguments[j]).to.equal(test.expected[j]);
                        }catch(e){
                            return done(e);
                        }
                    }
                    if(++doneN === tests.length){
                        done();
                    }
                });
            });
        });

        it('should regenerate only after timeout', function(done){
            var i = 0;
            var exec = function(assertion){
                cache.get('key', function(callback){
                    ++i;
                    callback(i);
                }, function(val){
                    assertion(val)
                }, 25);
            }

            exec(function(val){expect(val).to.equal(1);});

            setTimeout(function () {
                exec(function(val){expect(val).to.equal(1);});
            }, 12);

            setTimeout(function () {
                exec(function(val){
                    expect(val).to.equal(2);
                    done();
                });
            }, 50);
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
            cache.get('key', function(){}, function(){
                expect(cache.del('miss')).to.be.false;
            });
        });

        it('should return true given a key for an existing cache', function(){
            cache.get('key', function(){}, function(){
                expect(cache.del('key')).to.be.true;
            });
        });

        it('should force cache to regenerate', function(){
            var i = 0;
            var exec = function(assertion){
                cache.get('key', function(callback){
                    ++i;
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
            cache.get('key1', function(){}, function(){
                cache.get('key2', function(){}, function(){
                    cache.clear();

                    expect(cache.del('key1')).to.be.false;
                    expect(cache.del('key2')).to.be.false;
                });
            });
        });
    });

    describe('promise', function(){
        beforeEach(function() {
            cache.clear();
        });

        it('should return a Promise', function(){
            var p = cache.get('key', function(){});
            expect(p).to.be.an('Promise');
        });

        it('should return a Promise with value from direct return', function(done){
            var obj = {foo: 10};
            var tests = [
                {val: 10,       expected: 10},
                {val: "string", expected: "string"},
                {val:  obj,     expected:  obj},
            ];
            var doneN = 0;

            tests.forEach(function(test, i){
                var p = cache.get('key'+i, function(){
                    return test.val;
                });

                p.then(function(val){
                    try{
                        expect(val).to.equal(test.expected);
                    }catch(e){
                        return done(e);
                    }
                    if(++doneN === tests.length){
                        done();
                    }
                });
            });
        });

        it('should return a Promise using the cb with the first argument', function(done){
            var obj = {foo: 10};
            var tests = [
                {args: [10],                 expected: [10]},
                {args: ["string"],           expected: ["string"]},
                {args: [ obj],               expected: [ obj]},
                {args: [10, "string",  obj], expected: [10, "string",  obj]}
            ];
            var doneN = 0;

            tests.forEach(function(test, i){
                var p = cache.get('key'+i, function(callback){
                    callback.apply(null, test.args);
                });

                p.then(function(val){
                    try{
                        expect(val).to.equal(test.expected[0]);
                    }catch(e){
                        return done(e);
                    }
                    if(++doneN === tests.length){
                        done();
                    }
                });
            });
        });

        it('should return a Promise with value from returned Promise', function(done){
            var obj = {foo: 10};
            var tests = [
                {args: 10,       expected: 10},
                {args: "string", expected: "string"},
                {args: obj,      expected: obj}
            ];
            var doneN = 0;

            tests.forEach(function(test, i){
                var p = cache.get('key'+i, function(){
                    return Promise.resolve(test.args);
                });

                p.then(function(val){
                    try{
                        expect(val).to.equal(test.expected);
                    }catch(e){
                        return done(e);
                    }
                    if(++doneN === tests.length){
                        done();
                    }
                });
            });
        });

        it('should be able to reuse a Promise', function(done){
            var val = 'hello';
            var exec = function(){
                return cache.get('key', function(){
                    return Promise.resolve(val);
                });
            };

            exec().then(function(out){
                try{
                    expect(out).to.equal(val);
                    exec().then(function(out){
                        try{
                            expect(out).to.equal(val);
                            exec().then(function(out){
                                try{
                                    expect(out).to.equal(val);
                                    done();
                                }catch(e){
                                    done(e);
                                }
                            });
                        }catch(e){
                            done(e);
                        }
                    });
                }catch(e){
                    done(e);
                }
            });
        });

        it('should be able to catch a rejected Promise', function(done){
            var exec = function(){
                return cache.get('key', function(){
                    return Promise.reject(new Error());
                });
            };

            exec().then(function(){
                done(new Error('Should not complete'));
            }).catch(function(e){
                try{
                    expect(e).to.be.a('Error');
                    done();
                }catch(e){
                    done(e);
                }
            });
        });

        it('should be able to catch an uncaught error', function(done){
            var exec = function(){
                return cache.get('key', function(){
                    throw new Error()
                });
            };

            exec().then(function(){
                done(new Error('Should not complete'));
            }).catch(function(e){
                try{
                    expect(e).to.be.a('Error');
                    done();
                }catch(e){
                    done(e);
                }
            });
        });
    });
});

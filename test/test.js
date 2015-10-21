var vm = require('vm');
var fs = require('fs');
var less = fs.readFileSync(require.resolve('../jquery.less.min.js'));

var script = new vm.Script(less);
var globals = {
    jQuery: function jQuery(selector) {
        function Selection() {
            this._selection = [selector];

            this.add = function($sel) {
                var output = new Selection();
                output._selection = this._selection.concat($sel._selection);
                return output;
            };

            this.not = function($sel) {
                var output = new Selection();
                output._selection = this._selection.filter(function(selector) {
                    for(var i = 0; i < $sel._selection.length; i++) {
                        if(selector == $sel._selection[i]) {
                            return false;
                        }
                    }
                    return true;
                });
                return output;
            };
        }
        Selection.prototype = jQuery.fn;
        return new Selection();
    }
};
globals.jQuery.fn = { };

module.exports = {
    inline: {
        setUp: function(done) {
            var context = vm.createContext(globals);
            script.runInContext(context);
            done();
        },
        tearDown: function(done) {
            done();
        },
        variables: function(test) {
            // Add set comparison for jQuery selections
            test.setEqual = function(actual, expected, msg) {
                if(Array.isArray(actual) && Array.isArray(expected)) {
                    var i, j;
                    var found;
                    for(i = 0; i < actual.length; i++) {
                        found = false;
                        for(j = 0; j < expected.length; j++) {
                            if(actual[i] == expected[j]) {
                                found = true;
                                break;
                            }
                        }
                        if(!found) {
                            return test.equal(actual, expected, msg);
                        }
                    }
                    for(j = 0; j < expected.length; j++) {
                        found = false;
                        for(i = 0; i < actual.length; i++) {
                            if(actual[i] == expected[j]) {
                                found = true;
                                break;
                            }
                        }
                        if(!found) {
                            return test.equal(actual, expected, msg);
                        }
                    }
                    return test.ok(true, msg);
                } else {
                    return test.equal(actual, expected, msg);
                }
            };

            // Alias jQuery
            var $ = globals.jQuery;

            // Define initial globals
            $.less('@font', '#25255B');
            $.less('@display', 'block');
            $.less('@size', '24');

            test.equal($.less('@font'), '#25255B');
            test.equal($.less('@display'), 'block');
            test.equal($.less('@size'), 24);

            $.fn.css = function(prop, value) {
                test.setEqual(this._selection, ['.test']);
                test.equal(prop, 'display');
                test.equal(value, 'block');
            };
            $('.test').less('display', '@display');

            $.fn.css = function(prop, value) {
                test.setEqual(this._selection, ['.test']);
                test.equal(prop, 'font-size');
                test.equal(value, 24);
            };
            $('.test').less('font-size', '@size');

            (function() {
                var call_count = 0;
                $.fn.css = function(prop, value) {
                    switch(call_count) {
                        case 0:
                            test.setEqual(this._selection, ['#test']);
                            test.equal(prop, 'color');
                            test.equal(value, '#25255B');
                            break;
                        case 1:
                            test.setEqual(this._selection, ['#test']);
                            test.equal(prop, 'font-size');
                            test.equal(value, 24);
                            break;
                        default:
                            test.ok(false, 'Call count exceeded');
                            break;
                    }

                    call_count++;
                };
            })();
            $('#test').less({
                'color': '@font',
                'font-size': '@size'
            });

            $.fn.css = function(prop, value) {
                test.setEqual(this._selection, ['#test']);
                test.equal(prop, 'color');
                test.equal(value, '#636142');
            };
            $.less('@font', '#636142');

            $.fn.css = function(prop, value) {
                test.setEqual(this._selection, ['#test', '.test']);
                test.equal(prop, 'font-size');
                test.equal(value, 26);
            };
            $.less('@size', 26);

            $.fn.css = function(prop, value) {
                test.setEqual(this._selection, ['.test']);
                test.equal(prop, 'font-size');
                test.equal(value, 18);
            };
            $('.test').less('font-size', 18);

            $.fn.css = function(prop, value) {
                test.setEqual(this._selection, ['#test']);
                test.equal(prop, 'font-size');
                test.equal(value, 24);
            };
            $.less('@size', 24);

            test.done();
        }
    },
    file: {
        setUp: function(done) {
            var context = vm.createContext(globals);
            script.runInContext(context);
            done();
        },
        tearDown: function(done) {
            done();
        }
    }
};

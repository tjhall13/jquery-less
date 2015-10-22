(function($) {
    var variables = { };
    var values = [{ }];

    var constant = /^[^@]+$/;

    function add(prop, value, query) {
        if(!query) {
            query = value;
        }
        var properties, queries;
        if(variables[value]) {
            properties = variables[value];
            if(properties[prop]) {
                queries = properties[prop];
                if(queries[query]) {
                    queries[query] = properties[prop][query].add(this);
                } else {
                    properties[prop][query] = this;
                }
            } else {
                properties[prop] = { };
                properties[prop][query] = this;
            }
        } else {
            variables[value] = { };
            variables[value][prop] = { };
            variables[value][prop][query] = this;
        }
    }

    function remove(prop) {
        for(var name in variables) {
            if(variables[name][prop]) {
                for(var query in variables[name][prop]) {
                    variables[name][prop][query] = variables[name][prop][query].not(this);
                }
            }
        }
    }

    function update(prop, value) {
        var values = String(value).trim().split(/\s+/);
        var query = values.join(' ');
        var unbound = true;
        for(var i = 0; i < values.length; i++) {
            if(!constant.test(values[i])) {
                add.call(this, prop, values[i], query);
                unbound = false;
            }
        }
        if(unbound) {
            remove.call(this, prop);
        }
        style.call(this, prop, values);
    }

    function style(prop, values) {
        var value;
        if(values) {
            var self = this;
            value = values.reduce(function(current, value) {
                if(constant.test(value)) {
                    return current + ' ' + value;
                } else {
                    return current + ' ' + resolve.call(self, value);
                }
            }, '');
            if(value.length) {
                // Remove leading space
                value = value.substr(1);
            } else {
                // If value is undefined, do nothing
                return this;
            }
        }
        // Apply css styles to this selection
        return this.css(prop, value);
    }

    function resolve(name, value) {
        var scope;
        if(this) {
            // If this is not null find scope
            // TODO: find scope
            scope = values[0];
        } else {
            // If this is null use global scope
            scope = values[0];
        }
        if(value === undefined) {
            // Get value for variable name
            return scope[name];
        } else {
            // Set value for variable name
            scope[name] = value;
        }
    }

    function queryResolve(query) {
        return function(value) {
            if(constant.test(value)) {
                return value;
            } else {
                return resolve.call(query, value);
            }
        };
    }

    $.fn.less = function less(prop, value) {
        if(typeof prop == 'string' && prop.charAt(0) == '@') {
            // Get/Set contextual variable
            return resolve.call(this, prop, value);
        } else {
            // Add less properties dependent on variables
            if(value !== undefined) {
                update.call(this, prop, value);
            } else {
                if(typeof prop == 'object' && !Array.isArray(prop)) {
                    // For each property in the object, call this
                    // function with the associated value
                    for(var member in prop) {
                        less.call(this, member, prop[member]);
                    }
                } else {
                    // Return current css value for property(s)
                    return this.css(prop);
                }
            }
        }
    };

    $.less = function(name, value) {
        // Set global variable values
        if(value) {
            // Set the variable with name to value
            resolve(name, value);

            var properties = variables[name];
            if(properties) {
                // For each property using this variable, update
                // the css
                for(var prop in properties) {
                    var queries = properties[prop];
                    if(queries) {
                        // For each property value in this
                        // property, update the css
                        for(var query in queries) {
                            value = query.split(' ').map(queryResolve(queries[query])).join(' ');
                            queries[query].css(prop, value);
                        }
                    }
                }
            }
        } else {
            return resolve(name);
        }
    };

    $._less = function() {
        return variables;
    };
})(jQuery);

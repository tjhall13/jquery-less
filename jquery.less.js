(function($) {
    var variables = { };
    var values = [{ }];

    var constant = /^[^@]+$/;

    function add(prop, value, definition) {
        if(!definition) {
            definition = value;
        }
        var properties, definitions;
        if(variables[value]) {
            properties = variables[value];
            if(properties[prop]) {
                definitions = properties[prop];
                if(definitions[definition]) {
                    definitions[definition] = properties[prop][definition].add(this);
                } else {
                    properties[prop][definition] = this;
                }
            } else {
                properties[prop] = { };
                properties[prop][definition] = this;
            }
        } else {
            variables[value] = { };
            variables[value][prop] = { };
            variables[value][prop][definition] = this;
        }
    }

    function remove(prop) {
        for(var name in variables) {
            if(variables[name][prop]) {
                for(var definition in variables[name][prop]) {
                    variables[name][prop][definition] = variables[name][prop][definition].not(this);
                }
            }
        }
    }

    function update(prop, value) {
        var values = String(value).trim().split(/\s+/);
        var definition = values.join(' ');
        var unbound = true;
        for(var i = 0; i < values.length; i++) {
            if(!constant.test(values[i])) {
                add.call(this, prop, values[i], definition);
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

    function find(definition) {
        return function(value) {
            if(constant.test(value)) {
                return value;
            } else {
                return resolve.call(definition, value);
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
                    var definitions = properties[prop];
                    if(definitions) {
                        // For each property value in this
                        // property, update the css
                        for(var definition in definitions) {
                            value = definition.split(' ').map(find(definitions[definition])).join(' ');
                            definitions[definition].css(prop, value);
                        }
                    }
                }
            }
        } else {
            return resolve(name);
        }
    };
})(jQuery);

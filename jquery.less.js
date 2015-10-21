(function($) {
    var variables = { };
    var values = [{ }];

    function add(prop, name) {
        var properties;
        if(variables[name]) {
            properties = variables[name];
            if(properties[prop]) {
                properties[prop] = properties[prop].add(this);
            } else {
                properties[prop] = this;
            }
        } else {
            properties = { };
            properties[prop] = this;
            variables[name] = properties;
        }
    }

    function remove(prop) {
        for(var name in variables) {
            if(variables[name][prop]) {
                variables[name][prop] = variables[name][prop].not(this);
            }
        }
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

    $.fn.less = function less(prop, value) {
        if(typeof prop == 'string' && prop.charAt(0) == '@') {
            // Get/Set contextual variable
            return resolve.call(this, prop, value);
        } else {
            // Add less properties dependent on variables
            if(value !== undefined) {
                if(typeof value == 'string' && value.charAt(0) == '@') {
                    if(value.charAt(1) != '@') {
                        // If it is not a constant, add selection
                        // to variables map
                        add.call(this, prop, value);
                    }

                    value = resolve.call(this, value);
                    if(value) {
                        // If value is defined then set new selection
                        // to correct value
                        return this.css(prop, value);
                    } else {
                        // If value is undefined, do nothing
                        return this;
                    }
                } else {
                    // Remove selection from variables map
                    remove.call(this, prop);

                    return this.css(prop, value);
                }
            } else {
                if(typeof prop == 'object' && !Array.isArray(prop)) {
                    // For each property in the object, call this
                    // function with the associated value
                    for(var member in prop) {
                        less.call(this, member, prop[member]);
                    }
                } else {
                    // Return current css properties for property(s)
                    return this.css(prop);
                }
            }
        }
    };

    $.less = function(name, value) {
        // Set global variable values
        if(value) {
            resolve(name, value);
            var properties = variables[name];
            if(properties) {
                // For each property using this variable, update
                // the css
                for(var prop in properties) {
                    properties[prop].css(prop, value);
                }
            }
        } else {
            return resolve(name);
        }
    };
})(jQuery);

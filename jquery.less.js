(function($) {
    var variables = { };
    var values = { };

    function addSelection($sel, prop, name) {
        var properties;
        if(variables[name]) {
            properties = variables[name];
            if(properties[prop]) {
                properties[prop] = properties[prop].add($sel);
            } else {
                properties[prop] = $sel;
            }
        } else {
            properties = { };
            properties[prop] = $sel;
            variables[name] = properties;
        }
    }

    function removeSelection($sel, prop) {
        for(var name in variables) {
            if(variables[name][prop]) {
                variables[name][prop] = variables[name][prop].not($sel);
            }
        }
    }

    $.fn.less = function less(prop, value) {
        // Add less properties dependent on variables
        if(value) {
            if(typeof value == 'string' && value.charAt(0) == '@') {
                if(value.charAt(1) != '@') {
                    // If it is not a constant, add selection
                    // to variables map
                    addSelection(this, prop, value);
                }

                value = values[value];
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
                removeSelection(this, prop);

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
                if(typeof prop == 'string' && prop.charAt(0) == '@') {
                    // Get contextual variable value
                    return value[prop];
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
            values[name] = value;
            var properties = variables[name];
            if(properties) {
                // For each property using this variable, update
                // the css
                for(var prop in properties) {
                    properties[prop].css(prop, value);
                }
            }
        } else {
            return values[name];
        }
    };
})(jQuery);

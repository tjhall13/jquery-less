(function($) {
    var variables = { };
    var values = { };

    $.fn.less = function(prop, value) {
        // Add less properties dependent on variables
        if(value) {
            if(value.charAt(0) == '@') {
                if(variables[value] === undefined) {
                    variables[value] = [];
                }
                variables[value].push(this);
                value = values[value];
                if(value) {
                    return this.css(prop, value);
                } else {
                    return this;
                }
            } else {
                return this.css(prop, value);
            }
        } else {
            return this.css(prop);
        }
    };

    $.less = function(name, value) {
        // Set global variable values
        if(value) {
            values[name] = value;
            variables[name].forEach(function(obj) {
                obj.css()
            });
        } else {
            return values[name];
        }
    };
})(jQuery);

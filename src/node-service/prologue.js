// Make it look more node-like
if (typeof require === 'undefined') {
    require = IMPORTS.require;
}

// Enable logging
var logger = require('pmloglib');

String.prototype.trim = function() {
    return this.replace(/^\s+|\s+$/g, "");
};

String.prototype.startsWith = function(str) {
    return (this.indexOf(str) == 0);
};

String.prototype.endsWith = function(str) {
    var lastIndex = this.lastIndexOf(str);
    return (lastIndex != -1) && (lastIndex + str.length == this.length);
};
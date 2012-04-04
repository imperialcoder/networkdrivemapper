var util = {};

util.wrap = function(innerFunc, outerFunc) {
  return function() {
    var args = [innerFunc];
    args.push.apply(args, arguments);
    outerFunc.apply(null, args);
  };
};

util.extend = enyo.mixin;

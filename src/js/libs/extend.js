module.exports = function(Parent, proto) {
  var F, key, value, _super, attributes = {};

  F = function() {
    return Parent.call(this, arguments);
  };

  _super = Parent.prototype;
  _super._superProto = proto;

  F.prototype = Object.create(_super);
  F.prototype.constructor = Parent;

  for (key in proto) {
    value = proto[key];

    if (typeof value === 'function') {
      F.prototype[key] = _super[key] ? (function(key, value) {
        return function() {
          var ret;
          this._super = _super[key];
          ret = value.apply(this, arguments);
          delete this._super;
          return ret;
        };
      })(key, value) : value;
    } else {
      attributes[key] = value;
    }
  }

  return F;
};

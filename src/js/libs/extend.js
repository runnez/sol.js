var $      = require('jquery');

module.exports = function(Parent, proto) {
  var F, key, value, _super, attributes = {};

  F = function() {
    return Parent.apply(this, arguments);
  };

  _super = $.extend(true, {}, Parent.prototype);

  if (_super._superProto) {
    _super._superProto = $.extend({}, _super._superProto);
  } else {
    _super._superProto = proto;
  }

  _super._superAttrs = attributes;

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

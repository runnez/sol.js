var $ = require('jquery');

module.exports = function(Parent, proto) {
  var F, key, value, _super, attributes = {};

  F = function() {
    return Parent.apply(this, arguments);
  };

  _super = $.extend(true, {}, Parent.prototype);

  F.prototype = Object.create(_super);
  F.prototype.constructor = Parent;

  for (key in proto) {
    value = proto[key];

    if (typeof value === 'function') {
      F.prototype[key] = _super[key] ? (function(key, value) {
        return function() {
          var args    = arguments;
          this._super = function() {
            return _super[key].apply(this, args);
          }
          var result  = value.apply(this, args);
          delete this._super;
          return result;
        };
      })(key, value) : value;
    } else {
      attributes[key] = value;
    }
  }

  if (_super._superAttrs) {
    _super._superAttrs = $.extend(true, {}, _super._superAttrs, attributes);
  } else {
    _super._superAttrs = attributes;
  }

  return F;
};

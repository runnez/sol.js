var $      = require('jquery');
var extend = require('./extend');

module.exports = (function() {
  var components = {};

  function Base($block, attributes) {
    this.$block = $block;
    this.created();
    _setAttributes.call(this, this._superProto, attributes);
    _bindEvents.call(this, this.$block, this.events);
  }

  Base.prototype.created   = function() {};
  Base.prototype.destroyed = function() {};

  function _setAttributes(superProto, attributes) {
    $.extend(this, superProto, attributes);
  };

  function _destroyed() {
    _unbindEvents.call(this, this.$block, this.events);
    this.destroyed();
  }

  function _unbindEvents($block, events) {
    $.each(events, function(key, callback) {
      var event = _parseEvent.call(this, $block, key, callback);
      event.$block.off(event.name, event.selector, event.callback);
    }.bind(this));

    $block.off('destroyed');
  }

  function _bindEvents($block, events) {
    $.each(events, function(key, callback) {
      var event = _parseEvent.call(this, $block, key, callback);
      event.$block.on(event.name, event.selector, event.callback);
    }.bind(this));

    $block.on('destroyed', _destroyed.bind(this));
  };

  function _parseEvent($block, key, callback) {
    key = key.split(' on ');

    if (key[1] && key[1] == 'window') {
      event = { $block: $(window), selector: null, name: key[0] }
    } else if (key.length) {
      event = { $block: $block, selector: key[1], name: key[0] }
    } else {
      event = { $block: $block, selector: null, name: key }
    }

    if (typeof callback !== 'function') {
      event.callback = this[callback];
    } else {
      event.callback = callback.bind(this);
    }

    return event;
  }

  /* ---------------------------------------------------------
   * define
   * --------------------------------------------------------- */

  function define(name, parent, proto) {
    if (proto == null) {
      proto = false;
    }

    if (!proto) {
      proto = parent;
    }

    return components[name] = extend(Base, proto);
  };

  /* ---------------------------------------------------------
   * vitalize
   * --------------------------------------------------------- */

  function vitalize() {
    $(document).find('[data-component]:not([data-ready])').each(function() {
      $el          = $(this);
      elComponents = $el.data('component').split(' ')

      for (var i = 0, len = elComponents.length; i < len; i++) {
        if (!components[elComponents[i]]) {
          new Error('Component not defined.');
          return;
        }

        new components[elComponents[i]]($el, $el.data('options') || {});
      }
    });
  };

  return {
    define: define,
    vitalize: vitalize
  };
})();


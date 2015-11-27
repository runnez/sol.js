(function($, window) {
  var extend = function(Parent, proto) {
    var F = function () {
      return Parent.apply(this, arguments);
    }

    var _super = $.extend(true, {}, Parent.prototype);

    F.prototype = Object.create(_super);
    F.prototype.constructor = Parent;

    for (var key in proto) {
      var value = proto[key];

      if (typeof value !== 'function') continue;

      F.prototype[key] = _super[key] ? (function(key, value) {
        return function() {
          this._super = function() {
            return _super[key].apply(this, arguments);
          };
          var result  = value.apply(this, arguments);
          delete this._super;
          return result;
        };
      })(key, value) : value;
    }

    var props = _extractProps(proto);

    if (_super._superProps) {
      _super._superProps = $.extend(true, {}, _super._superProps, props);
    } else {
      _super._superProps = props;
    }

    return F;
  };

  function _extractProps(object) {
    var props = {};

    for (var key in object) {
      var value = object[key];

      if ($.isFunction(value)) continue;

      props[key] = value;
    }

    return props;
  }

  var components = {};

  function Core($block, options) {
    $.extend(true, this, this._superProps);
    this.$block   = $block;
    this.options  = $.extend(true, {}, this.defaults , options);
    _bindEvents.call(this);
    this.init();

    return this;
  }

  Core.prototype = {
    init: function() {},

    el: function(name) {
      return ['.js-', this._namespace, name[0].toUpperCase() + name.slice(1)].join('');
    },

    $: function(selector) {
      return this.$block.find(selector);
    }
  };

  function _bindEvents() {
    var $block = this.$block, events = this.events;

    for (var key in events) {
      var _self = this;
      var event = _parseEvent.call(this, $block, key, events[key]);

      (function(event) {
        var callback = function() {
          event.callback.apply(_self, [].concat([].slice.call(arguments), [$(this)]));
        };

        if (event.selector && event.selector[0] === '%') {
          event.selector = _self._elName(event.selector.slice(1));
        }

        event.target.on(event.name, event.selector, callback);

        if (event.target[0] == window) {
          _self.$block.on('remove', function() {
            event.target.off(event.name, callback);
          });
        }
      })(event);
    }

    this.$block.on('remove', this.remove);
  }

  function _parseEvent($block, key, callback) {
    var event;
    key = key.split(' on ');

    if (key[1] && key[1] == 'window') {
      event = { target: $(window), selector: null, name: key[0] };
    } else if (key.length) {
      event = { target: $block, selector: key[1], name: key[0] };
    } else {
      event = { target: $block, selector: null, name: key };
    }

    if (typeof callback !== 'function') {
      event.callback = this[callback];
    } else {
      event.callback = callback;
    }

    return event;
  }

  function define(name, parent, proto) {
    if (parent && proto) {
      parent = components[parent];
    }

    if (!proto) {
      proto  = parent;
      parent = Core;
    }

    proto._namespace = name;

    return components[name] = extend(parent, proto);
  }

  function attachComponent(name, el, options) {
    new components[name](el, options);
  }

  function vitalize() {
    $(document).find('[data-component]:not([data-ready])').each(function() {
      var $el = $(this);
      var attrComponents = $el.data('component').split(' ');

      for (var i = 0, len = attrComponents.length; i < len; i++) {
        if (!components[attrComponents[i]]) {
          return new Error('Component not defined.');
        }

        attachComponent(attrComponents[i], $el, $el.data('options') || {});
      }

      $el.attr('data-ready', true);
    });
  }

  window.Component = {
    define: define,
    vitalize: vitalize
  };

})($, window);

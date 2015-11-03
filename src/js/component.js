var $ = require('jquery');

module.exports = (function() {

  /* ---------------------------------------------------------
   * Extend
   * --------------------------------------------------------- */

  var extend = function(Parent, proto) {
    var F, key, value, _super, attributes = {};

    F = function() {
      $.extend(true, this, this._superAttrs);

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

  /* ---------------------------------------------------------
   * Remove event
   * --------------------------------------------------------- */

  $.cleanData = ( function( orig ) {
    return function( elems ) {
      var events, elem, i;
      for ( i = 0; ( elem = elems[ i ] ) != null; i++ ) {
        try {

          // Only trigger remove when necessary to save time
          events = $._data( elem, "events" );
          if ( events && events.remove ) {
            $( elem ).triggerHandler( "remove" );
          }

        // Http://bugs.jquery.com/ticket/8235
        } catch ( e ) {}
      }
      orig( elems );
    };
  } )( $.cleanData );

  /* ---------------------------------------------------------
   * Component Core
   * --------------------------------------------------------- */

  var components = {};
  var defaults   = {};

  function Core($block, options) {
    this.$block   = $block;
    this.defaults = this.defaults || defaults;
    this.options  = $.extend(true, {}, this.defaults , options);

    _bindEvents.call(this);
    this.init();
  }

  $.extend(true, Core.prototype, {
    init: function() {},
    remove: function() {},

    el: function(name) {
      return this.$(['.js', this._namespace, name].join('-'));
    },

    trigger: function(name, data) {
      $(document).trigger(name, data);
    },

    $: function(selector) {
      return this.$block.find(selector);
    },
  });

  function _setAttributes(attributes) {
    $.extend(true, this, this._superAttrs, attributes);
  };

  function _bindEvents($block, events) {
    var $block = this.$block,
        events = this.events;

    for (var key in events) {
      var _self = this;
      var event = _parseEvent.call(this, $block, key, events[key]);

      (function(event) {
        var callback = function() {
          var args = Array.prototype.slice.call(arguments);

          event.callback.apply(_self, $.merge(args, [$(this)]));
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
  };

  function _parseEvent($block, key, callback) {
    key = key.split(' on ');

    if (key[1] && key[1] == 'window') {
      event = { target: $(window), selector: null, name: key[0] }
    } else if (key.length) {
      event = { target: $block, selector: key[1], name: key[0] }
    } else {
      event = { target: $block, selector: null, name: key }
    }

    if (typeof callback !== 'function') {
      event.callback = this[callback];
    } else {
      event.callback = callback;
    }

    return event;
  }

  /* ---------------------------------------------------------
   * Public methods
   * --------------------------------------------------------- */

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
  };

  function vitalize() {
    $(document).find('[data-component]:not([data-ready])').each(function() {
      $el = $(this);
      attrComponents = $el.data('component').split(' ')

      for (var i = 0, len = attrComponents.length; i < len; i++) {
        if (!components[attrComponents[i]]) {
          return new Error('Component not defined.');
        }

        new components[attrComponents[i]]($el, $el.data('options') || {});
      }

      $el.attr('data-ready', true);
    });
  };

  return {
    define: define,
    vitalize: vitalize
  };
})();

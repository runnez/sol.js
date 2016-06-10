(function(factory) {
  "use strict";

  // Support commonjs and browser global
  if (typeof exports !== 'undefined' ) {
    module.exports = factory(require('jquery'), window);
  } else {
    window.Component = factory(window.$, window);
  }

}(function($, window) {

  /*
   * Add remove event to jQuery.
   *
   * Copy from jquery.ui
   * Need include component after jquery ui
   */

  if ($ && !$.ui) {
    $.cleanData = (function( orig ) {
      return function( elems ) {
        var events, elem, i;
        for ( i = 0; ( elem = elems[ i ] ) != null; i++ ) {
         // Only trigger remove when necessary to save time
          events = $._data( elem, "events" );
          if ( events && events.remove ) {
            $( elem ).triggerHandler( "remove" );
          }
        }
        orig( elems );
      };
    })($.cleanData);
  }

  var extend = function(Parent, proto) {
    // props in _superProps

    var F = function() {
      return Parent.apply(this, arguments);
    }

    var _super = $.extend(true, {}, Parent.prototype);

    F.prototype = Object.create(_super);
    F.prototype.constructor = Parent;

    var props = {};

    for (var key in proto) {
      var value = proto[key];
      if (!proto.hasOwnProperty(key)) continue;

      if (typeof value === 'function') {
        F.prototype[key] = _super[key] ? (function(key, value) {
          return function() {
            // TODO need test args
            var args = arguments;
            this._super = function() {
              return _super[key].apply(this, args);
            };
            var result  = value.apply(this, args);
            delete this._super;
            return result;
          };
        })(key, value) : value;
      } else {
        props[key] = value;
      }
    }

    if (_super._superProps) {
      _super._superProps = $.extend(true, {}, _super._superProps, props);
    } else {
      _super._superProps = props;
    }

    return F;
  };

  var components = {};

  function Core($block, options) {
    console.log(this)
    $.extend(true, this, this._superProps);
    this.$block   = $block;
    this.options  = $.extend(true, {}, this.defaults , options);
    this._bindEvents();
    this.init();

    return this;
  }

  Core.prototype = {
    init: function() {},

    trigger: function(event, data) {
      return this.$block.trigger(event, data);
    },

    dispatch: function(event, data) {
      return this.$block.parents('[data-component]').triggerHandler(event, data);
    },

    broadcast: function(event, data) {
      return this.$block.find('[data-component]').triggerHandler(event, data);
    },

    $: function(selector, $context) {
      return ($context || this.$block).find(_replaceShortcuts.call(this, selector));
    },

    _elName: function(name) {
      return ['.js-', this._namespace, name[0].toUpperCase() + name.slice(1)].join('');
    },

    _componentName: function(name) {
      return '[data-component~="' + name + '"]';
    },

    _bindEvents: function() {
      var $block = this.$block, events = this.events;

      for (var key in events) {
        var _self = this;
        var event = this._parseEvent.call(this, $block, key, events[key]);

        (function(event) {
          var callback = function() {
            event.callback.apply(_self, [].concat([].slice.call(arguments), [$(this)]));
          };

          event.target.on(event.name, event.selector, callback);

          if (event.target[0] == window || event.target[0] == document) {
            _self.$block.on('remove', function() {
              event.target.off(event.name, callback);
            });
          }
        })(event);
      }

      this.$block.on('remove', this.remove);
    },

    _parseEvent: function($block, key, callback) {
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
  };

  function define(name, parent, proto) {
    if (parent && proto) {
      parent = components[parent];
    }

    if (!proto) {
      proto  = parent;
      parent = Core;
    }

    proto.componentName = name;

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

  return {
    define: define,
    vitalize: vitalize,
    config: {
    }
  }

}))

// componentSelector [data-component]
// componentReadySelector [data-ready]

// vitalizer

// hooks

// bindEvents
// watch

// can modify base proto
// can hook in base constructor


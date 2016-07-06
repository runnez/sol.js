(function(factory) {
  "use strict";

  if (typeof exports !== "undefined" ) {
    // Support commonjs
    module.exports = factory(require("jquery"), window);
  } else {
    // Browser global
    window.Sol = factory(window.$, window);
  }

}(function($, window) {

  var config = {
    debug: false
  }

  var Registry = {
    components: {}
  }

  var Sol = {
    vitalize: vitalize,
    component: component,
    use: use,
    config: config
  }

  function vitalize(target) {
    var $target  = $(target || document);
    var selector = "[data-component]:not([data-component-ready])"

    $target
      .filter(selector)
      .add($target.find(selector))
      .each(function() {
        var $el        = $(this).attr('data-component-ready', true);
        var options    = $el.data('options') || {};
        var components = $el.data('component');

        components && components.split(' ').forEach(function(component) {
          attach(component, $el, options);
        });
      });
  }

  function attach(name, el, options) {
    var component = Registry.components[name];

    if (component) {
      if (config.debug) console.log('Component %s is inited with options %O', name, options);
      return new component(el, options);
    } else {
      throw new Error(['Component', name, 'is not defined.'].join(' '));
    }
  }

  function component(name, parent, proto) {
    if (parent && proto) {
      parent = Registry.components[parent];
    }

    if (!proto) {
      proto  = parent;
      parent = Core;
    }

    proto._componentName = name;

    return Registry.components[name] = extend(parent, proto);
  }

  function extend(Parent, definition) {
    var parentProto = Parent.prototype;

    var Child = function() {
      return Parent.apply(this, arguments);
    }

    Child.prototype = Object.create(parentProto);
    Child.prototype.constructor = Parent;

    for (var key in definition) {
      var value = definition[key];
      // We dont check hasOwnProperty for func and object case when deep inherit cases

      if (isFn(value) && isFn(parentProto[key])) {
        Child.prototype[key] = wrapFn(parentProto[key], value);
      } else if (isObj(value) && isObj(parentProto[key])) {
        Child.prototype[key] = $.extend(true, {}, parentProto[key], value)
      } else {
        Child.prototype[key] = value;
      }
    }

    return Child;
  }

  function wrapFn(parentFn, fn) {
    return function() {
      this._super = parentFn;
      var result = fn.apply(this, arguments);
      this._super = undefined;
      return result;
    }
  }

  var filters = [];

  function Core($block, options) {
    $.extend(true, this, options);

    this.$block = $block;

    if (isFn(this.prevent) && this.prevent()) {
      if (config.debug) console.warn('Component %s is prevented.', this._componentName);
      return;
    }

    filters.forEach(function(filter) {
      filter.call(this);
    }.bind(this));

    this.init();
  }

  Core.prototype = {
    init: function() {},

    _elName: function(name) {
      return ['.js-', this._componentName, name[0].toUpperCase() + name.slice(1)].join('');
    },

    _componentName: function(name) {
      return '[data-component~="' + name + '"]';
    },

    trigger: function(event, data) {
      this.$block.trigger(event, data);
    },

    dispatch: function(event, data) {
      this.$block.parents('[data-component]').each(function() {
        $(this).triggerHandler(event, data);
      });
    },

    broadcast: function(event, data) {
      this.$block.find('[data-component]').each(function() {
        $(this).triggerHandler(event, data);
      });
    },

    $: function(selector, $context) {
      return ($context || this.$block).find(_replaceShortcuts.call(this, selector));
    }
  }

  filters.push(
    function() {
      for (var key in this) {
        if (isObj(this[key]) && ['$block', 'events'].indexOf(key) == -1) {
          this[key] = $.extend({}, this[key])
        }
      }
    }
  )

  if ($ && !$.ui) addRemoveEvent();

  filters.push(
    function() {
      var $block = this.$block, events = this.events;

      for (var key in events) {
        var _self = this;
        var event = _parseEvent.call(this, $block, key, events[key]);

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
    }
  )

  function _replaceShortcuts(selector) {
    return selector ? selector
      .replace(/%%([\w\d-]+)/g, function(match, name) {
        return this._componentName(name);
      }.bind(this))
      .replace(/%([\w\d-]+)/g, function(match, name) {
        return this._elName(name);
      }.bind(this)) : null;
  }

  function _parseEvent($block, key, callback) {
    var event;
    key = key.split(' on ');

    if (key[1] && (key[1] == 'window' || key[1] == 'document')) {
      var target = key[1] == 'window' ? window : document;
      event = { target: $(target), selector: null, name: key[0] };
    } else if (key.length) {
      event = { target: $block, selector: key[1], name: key[0] };
    } else {
      event = { target: $block, selector: null, name: key };
    }

    event.selector = _replaceShortcuts.call(this, event.selector);
    event.callback = _parseCallbackName.call(this, callback);

    return event;
  }

  function _parseCallbackName(callback) {
    if (!isFn(callback)) {
      if (!this[callback]) {
        throw new Error(['Method', callback, 'not defined'].join(' '))
      }

      return this[callback];
    } else {
      return callback;
    }
  }

  function use(extension) {
    extension(Core, filters)
  }

  function addRemoveEvent() {
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

  function isFn(value) {
    return type(value) === 'function'
  }

  function isObj(value) {
    return type(value) === 'object'
  }

  function type(obj) {
    if (obj === void 0 || obj === null) {
      return String(obj);
    }

    var classToType = {
      '[object Boolean]': 'boolean',
      '[object Number]': 'number',
      '[object String]': 'string',
      '[object Function]': 'function',
      '[object Array]': 'array',
      '[object Date]': 'date',
      '[object RegExp]': 'regexp',
      '[object Object]': 'object'
    };

    return classToType[Object.prototype.toString.call(obj)];
  }

  return Sol
}))
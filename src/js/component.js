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

  var Registry = {
    components: {},
    mixins: {}
  }

  function Core($block, options) {
    $.extend(true, this, this._superProps, options);

    this.$block = $block;

    if (typeof this.prevent == 'function' && this.prevent()) {
      console.warn('Component %s is prevented.', this._namespace);
      return;
    }

    _bindEvents.call(this);

    _initWatch.call(this);

    this.mixins && this.mixins.forEach(function(mixin) {
      mixin.init && mixin.init.call(this);
    }, this);

    this.init();

    return this;
  }

  Core.prototype = {
    init: function() {},

    _elName: function(name) {
      return ['.js-', this._namespace, name[0].toUpperCase() + name.slice(1)].join('');
    },

    _componentName: function(name) {
      return '[data-component~="' + name + '"]';
    },

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
    }
  };

  function _initWatch() {
    var _self = this;
    var props = {};

    for (var name in _self.watch) {
      var callback = _parseCallbackName.call(_self, _self.watch[name]);
      props[name]  = _self[name];

      (function(name, callback) {
        Object.defineProperty(_self, name, {
          set: function(newValue) {
            props[name] = newValue;
            callback.call(_self, newValue);
          },
          get: function() {
            return props[name];
          }
        });
      })(name, callback);
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
    if (typeof callback !== 'function') {
      if (!this[callback]) {
        throw new Error(['Method', callback, 'not defined'].join(' '))
      }

      return this[callback];
    } else {
      return callback;
    }
  }

  function mixin(name, proto) {
    return Registry.mixins[name] = proto;
  }

  function define(name, parent, proto) {
    if (parent && proto) {
      parent = Registry.components[parent];
    }

    if (!proto) {
      proto  = parent;
      parent = Core;
    }

    proto._namespace = name;

    if (proto.mixins) {
      proto.mixins = proto.mixins.map(function(name) { return Registry.mixins[name] });

      proto = proto.mixins.concat([proto]).reduce(function(proto, mixin) {
        mixin.init = mixin.init || function() {};

        return $.extend(true, proto, mixin);
      }, {});
    }

    return Registry.components[name] = extend(parent, proto);
  }

  function attach(name, el, options) {
    var component = Registry.components[name];

    if (component) {
      console.log('Component %s is inited with options %O', name, options);
      return new component(el, options);
    } else {
      throw new Error(['Component', name, 'is not defined.'].join(' '));
    }
  }

  function vitalize(target) {
    var $target  = $(target || document);
    var selector = '[data-component]:not([data-component-ready])'

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

    $target.trigger('vitalized')
  }

  return {
    define: define,
    vitalize: vitalize,
    attach: attach,
    mixin: mixin
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


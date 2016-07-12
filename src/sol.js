(function(factory) {
  'use strict';

  if (typeof exports !== 'undefined') {
    // Support commonjs
    module.exports = factory(require('jquery'), window);
  } else {
    // Browser global
    window.Sol = factory(window.$, window);
  }

}(function($, window) {

  let config = {
    debug: false
  }

  let Registry = {
    components: {}
  }

  let filters = [];

  function vitalize(target) {
    let $target  = $(target || document);
    let selector = '[data-component]:not([data-component-ready])';

    $target
      .filter(selector)
      .add($target.find(selector))
      .each(function() {
        let $el = $(this).attr('data-component-ready', true);
        let { options, component } = $el.data();

        component && component.split(' ').forEach((component) => {
          attach(component, $el, options);
        });
      });
  }

  function attach(name, el, options) {
    let component = Registry.components[name];

    if (component) {
      if (config.debug) console.log('Component %s is inited with options %O', name, options);

      return new component(el, options);
    } else throw new Error(`Component ${name} is not defined.`)
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
    let parentProto = Parent.prototype;

    let Child = function(...args) {
      return Parent.apply(this, args);
    }

    Child.prototype = Object.create(parentProto);
    Child.prototype.constructor = Parent;

    for (let key in definition) {
      let value = definition[key];
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
    return function(...args) {
      this._super = parentFn;
      let result = fn.apply(this, args);
      this._super = undefined;
      return result;
    }
  }

  function Core($block, options) {
    $.extend(true, this, options);

    this.$block = $block;

    if (isFn(this.prevent) && this.prevent()) {
      if (config.debug) console.warn('Component %s is prevented.', this._componentName);
      return;
    }

    filters.forEach((filter) => filter.call(this))

    this.init();
  }

  Core.prototype = {
    init() {},

    _elName(name) {
      name = name[0].toUpperCase() + name.slice(1)

      return `.js-${this._componentName}${name}`;
    },

    _componentName(name) {
      return `[data-component~=${name}]`;
    },

    trigger(event, data) {
      this.$block.trigger(event, data);
    },

    dispatch(event, data) {
      this.$block.parents('[data-component]').each(function() {
        $(this).triggerHandler(event, data);
      });
    },

    broadcast(event, data) {
      this.$block.find('[data-component]').each(function() {
        $(this).triggerHandler(event, data);
      });
    },

    $(selector, $context) {
      return ($context || this.$block).find(_replaceShortcuts.call(this, selector));
    }
  }

  function _replaceShortcuts(selector) {
    return selector ? selector
      .replace(/%%([\w\d-]+)/g, (_, name) => this._componentName(name))
      .replace(/%([\w\d-]+)/g,  (_, name) => this._elName(name)) : null
  }

  function _parseEvent($block, key, callback) {
    let event;
    let [eventName, selector] = key.split(' on ');

    selector = { window, document }[selector] || selector

    if (selector && [window, document].includes(selector)) {
      event = { target: $(selector), selector: null, name: eventName };
    } else if (key) {
      event = { target: $block, selector: selector, name: eventName };
    } else {
      event = { target: $block, selector: null, name: key };
    }

    event.selector = _replaceShortcuts.call(this, event.selector);
    event.callback = _parseCallbackName.call(this, callback);

    return event;
  }

  function _parseCallbackName(callback) {
    if (!isFn(callback)) {
      if (!this[callback]) throw new Error(`Method ${callback} not defined`);

      return this[callback];
    } else return callback;
  }

  if ($ && !$.ui) addRemoveEvent();

  filters.push(function() {
    for (let key in this) {
      if (isObj(this[key]) && !['$block', 'events'].includes(key)) {
        this[key] = $.extend({}, this[key])
      }
    }
  });

  filters.push(function() {
    let { $block, events } = this;

    for (let key in events) {
      let event = _parseEvent.call(this, $block, key, events[key]);

      ((event) => {
        let callback = (e, ...args) => {
          event.callback.apply(this, [e, ...args, $(e.currentTarget)]);
        };

        event.target.on(event.name, event.selector, callback);

        if ([window, document].includes(event.target[0])) {
          this.$block.on('remove', () => {
            event.target.off(event.name, callback)
          });
        }
      })(event);
    }

    this.$block.on('remove', this.remove);
  });

  function use(extension) {
    extension(Core, filters);
  }

  function addRemoveEvent() {
    $.cleanData = ((fn) => {
      return (elems) => {
        let events, elem, i;
        for (i = 0; (elem = elems[i]) != null; i++) {
         // Only trigger remove when necessary to save time
          events = $._data(elem, 'events');
          if (events && events.remove) {
            $(elem).triggerHandler('remove');
          }
        }
        fn(elems);
      };
    })($.cleanData);
  }

  function isFn(value) {
    return type(value) === 'function';
  }

  function isObj(value) {
    return type(value) === 'object';
  }

  function type(obj) {
    if (obj === void 0 || obj === null) return String(obj);

    let classToType = {
      '[object Function]': 'function',
      '[object Boolean]':  'boolean',
      '[object Number]':   'number',
      '[object String]':   'string',
      '[object RegExp]':   'regexp',
      '[object Object]':   'object',
      '[object Array]':    'array',
      '[object Date]':     'date',
    };

    return classToType[Object.prototype.toString.call(obj)];
  }

  return { vitalize, component, use, config };
}));
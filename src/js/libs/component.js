var $      = require('jquery');
var extend = require('./extend');

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


module.exports = (function() {
  var components = {};

  function Base($block, attributes) {
    this.$block = $block;
    this.defaults = this.defaults || {};
    this.options = $.extend(true, {}, this.defaults, attributes.defaults);
    _setAttributes.call(this, attributes);
    _bindEvents.call(this);
    this.init();
  }

  $.extend(true, Base.prototype, {
    init: function() {},

    $: function(selector) {
      this.$block.find(selector);
    },

    trigger: function(name, data) {
      $(document).trigger(name, data);
    },

    destroy: function() {

    }
  });

  function _setAttributes(attributes) {
    console.log(this._superAttrs);
    $.extend(true, this, this._superAttrs, attributes);
  };

  function _destroy() {
    _unbindEvents.call(this, this.$block, this.events);
    this.destroy();
  }

  function _bindEvents($block, events) {
    var $block = this.$block,
        events = this.events;

    for (var key in events) {
      var callback = events[key];
      var e = _parseEvent.call(this, $block, key, callback);
      callback = e.callback.bind(this);
      e.target.on(e.name, e.selector, callback);

      if (e.target[0] == window) {
        var name = e.name;

        var removeCallback = (function(name, callback) {
          return function() {
            console.log(callback);
            e.target.off(name, callback);
          }
        }(name, callback));

        this.$block.on('remove', removeCallback);
      }
    }
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
   * define
   * --------------------------------------------------------- */

  function define(name, parent, proto) {
    if (parent && proto) {
      parent = components[parent];
    }

    if (!proto) {
      proto = parent;
      parent = Base;
    }

    return components[name] = extend(parent, proto);
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


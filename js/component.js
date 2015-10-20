(function() {
  var components = {};

  // private methods
  function setAttributes(target, attributes) {
    $.extend(target, this._superProto, attributes);
  };

  function bindEvents(target, events, object) {
    for (name in events) {
      (function (name, prop) {
        var parts = name.split(' on ');
        prop = typeof prop === 'function' ? prop : object[prop];

        if ( parts[1] == 'body' ) {
          $('body').on(parts[0], prop);

        } else if ( parts[1] == 'window' ) {
          $(window).on(parts[0], prop);

        } else if ( parts[1] ) {
          target.on(parts[0], parts[1], prop);

        } else {
          target.on(parts[0], prop);
        }
      })(name, events[name]);
    }
  };

  function Base(node, attributes) {
    this.block = node;
    this.init();
    setAttributes(this, this._superProto, attributes);
    bindEvents(this.block, this.events, this);
    console.log(this);
  }

  Base.prototype.init = function() {};

  function extend(Parent, proto) {
    var F, key, value, _super, attributes = {};

    F = function(arguments) {
      return Parent.call(this, arguments);
    };

    _super = Parent.prototype;
    _super._superProto = proto;

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

  function defineComponent(name, parent, proto) {
    if (proto == null) {
      proto = false;
    }

    if (!proto) {
      proto = parent;
    }

    return components[name] = extend(Base, proto);
  };

  function initialize() {
    function getAttributesFromElement($el) {
      return $el.data('options') || {}
    }

    $('[data-component]').each(function() {
      var names = $(this).data('component').split(' ');

      for (var i = 0; i < names.length; i++) {
        if (!components[names[i]]) {
          console.log('component not defined');
          return;
        }

        new components[names[i]]($(this), getAttributesFromElement($(this)));
      }
    });
  }

  $(document).on('ready', function() {
    initialize();
  });

  this.defineComponent = defineComponent;

}).call(this);


/*
@el('.js-#{compoentn_name}delete')

defineComponent name,
  create: ->
     * check inited?
     * bind events

  attributes/options: {}

  delegateEvents: ->

  destroy: ->
     * удаляем глобальные эвенты

  el: ->

  fetchEl: ->

evil.block 'Photoable',

evil.block 'Comments', BaseComments,
  events:
    'ajax:success on %commentForm': 'appendComment'
    'ajax:scucces on %deleteComment': 'deleteComment'
    'ajax:success on %deleteCommentPhoto': ''
    'click on commentLke': 'incrementCommentLikeCounter'
 */

defineComponent('Comments', {
  events: {
    'click on .js-delete': function(e) {
      console.log(e);
    },

    'click on .js-btn': function() {
    },

    'click': 'handler'
  },

  handler: function() {
    alert('1');
  },

  ajax: true,

  init: function() {
    console.log('children init');
  }
});


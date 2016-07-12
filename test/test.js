var jsdom = require("jsdom").jsdom;
var doc = jsdom("<html><body></body></html>");
var assert = require('assert');

window = doc.defaultView;
document = window.document;

$ = require('jquery');

$('body').html('<div id="fixtures"></div>');

var Sol = require('../src/sol.js');

var fixtures = null;

var body = function(html) {
  fixtures.html(html);
  Sol.vitalize();
}

describe('Component', function() {
  before(function() {
    fixtures = $('#fixtures');
  });

  afterEach(function() {
    fixtures.html('');
  });

  describe('define', function() {
    it('should define', function() {
      var Test = Sol.component('test', {});
      assert.equal(typeof (new Test($('body'))), 'object');
    });
  });

  describe('vitalize', function() {
    it('should protect multiple vitalize', function() {
      var inited = 0;

      Sol.component('test', {
        init: function() {
          inited++;
        }
      });

      Sol.vitalize();
      Sol.vitalize();

      body('<div data-component="test"></div>');

      assert.equal(inited, 1);
    });

    it('works with multiple blocks on same node', function() {
      var inited = 0;

      Sol.component('test', {
        init: function() {
          inited++;
        }
      });

      Sol.component('test2', {
        init: function() {
          inited++;
        }
      });

      body('<div data-component="test test2"></div>');

      Sol.vitalize();

      assert.equal(inited, 2);
    });
  });

  describe('methods', function() {
    it('init fire after vitalize', function() {
      var inited = 0;

      Sol.component('test', {
        init: function() {
          inited = 1;
        }
      });

      body('<div data-component="test"></div>');

      Sol.vitalize();

      assert.equal(inited, 1);
    });

    it('_super call parent method', function() {
      var fire = 0;

      Sol.component('test', {
        init: function() {
          fire--;
        }
      });

      Sol.component('powerTest', 'test', {
        init: function() {
          this._super();
          fire++;
        }
      });

      body('<div data-component="powerTest"></div>');

      Sol.vitalize();

      assert.equal(fire, 0);
    });

    it('super accept arguments', function() {
      var fire = 0;

      Sol.component('test', {
        init: function(val) {
          fire = val;
        }
      });

      Sol.component('powerTest', 'test', {
        init: function() {
          this._super(5);
        }
      });

      body('<div data-component="powerTest"></div>');

      Sol.vitalize();

      assert.equal(fire, 5);
    });

    it('super accept arguments from events binding', function() {
      var event, element;

      Sol.component('test', {
        events: {
          click: 'fires'
        },

        fires: function(e, $el) {
          event = e;
          element = $el;
        }
      });

      Sol.component('powerTest', 'test', {
        fires: function(e, $el) {
          this._super(e, $el)
        }
      });

      body('<div data-component="powerTest"></div>');

      Sol.vitalize();

      $('[data-component="powerTest"]').trigger('click');
      assert.equal(event instanceof $.Event && element instanceof $, true);
    });
  });

  describe('props', function() {
    it('should define props', function() {
      var Test = Sol.component('test', { a: 1 });
      assert.equal(new Test($('body')).a, 1);
    });

    it('should override inherit props', function() {
      var Test = Sol.component('test', { a: 1, b: 2 });
      var PowerTest = Sol.component('powerTest', 'test', {
        b: 3
      });

      assert.equal(new PowerTest($('body')).b, 3);
    });

    it('should dont override parent props', function() {
      var Test = Sol.component('test', { a: 1, b: 2 });
      var PowerTest = Sol.component('powerTest', 'test', {
        b: 3
      });

      assert.equal(new PowerTest($('body')).a, 1);
    });

    it('should isolate object props with multiple instance', function() {
      var b = 0;

      Sol.component('test', {
        events: {
          click: 'increment'
        },

        b: {
          c: 0
        },

        increment: function() {
          this.b.c++;
          b = this.b.c
        }
      });

      body('<div id="a" data-component="test"></div><div id="b" data-component="test"></div>');

      $('#a').click()
      $('#b').click()

      assert.equal(b, 1);
    });

    it('should dont override parent object props', function() {
      var Test = Sol.component('test', { a: 1, b: {
        d: 1
      }});

      var PowerTest = Sol.component('powerTest', 'test', { b: {
        f: 1
      }});

      assert.equal(new PowerTest($('body')).b.d, 1);
    });
  });

  describe('events', function() {
    it('should bind events', function() {
      var fire = 0;

      Sol.component('test', {
        events: {
          'click': 'handler'
        },

        handler: function(e) {
          fire = 1;
        }
      });

      body('<div data-component="test"></div>');

      $('div').trigger('click');

      assert.equal(fire, 1);
    });

    it('listens window events', function() {
      var fire = 0;

      Sol.component('test', {
        events: {
          'click on window': 'handler'
        },

        handler: function(e) {
          fire = 1;
        }
      });

      body('<div data-component="test"></div>');

      $(window).trigger('click');

      assert.equal(fire, 1);
    });

    it('off window handlers after remove', function() {
      var fire = 0;

      Sol.component('test', {
        events: {
          'click on window': 'handler',
          'resize on window': 'handler'
        },

        handler: function(e) {
          fire++;
        }
      });

      body('<div data-component="test"></div>');

      $(window).trigger('click');
      $('[data-component]').remove();
      $(window).trigger('click');
      $(window).trigger('resize');

      assert.equal(fire, 1);
    });

    it('should inherit events', function() {
      var fire = 0;

      Sol.component('test', {
        events: {
          'click': 'handler'
        },

        handler: function(e) {
          fire++;
        }
      });

      Sol.component('powerTest', 'test', {
        events: {
          'fire': 'handler'
        }
      });

      body('<div data-component="powerTest"></div>');

      $('div').trigger('click');
      $('div').trigger('fire');

      assert.equal(fire, 2);
    });
  });
});

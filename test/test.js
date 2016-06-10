var jsdom = require("jsdom").jsdom;
var doc = jsdom("<html><body></body></html>");
var assert = require('assert');

window = doc.defaultView;
document = window.document;

$ = require('jquery');

$('body').html('<div id="fixtures"></div>');

var Component = require('../src/js/component.js');

var fixtures = null;

var body = function(html) {
  fixtures.html(html);
  Component.vitalize();
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
      var Test = Component.define('test', {});
      assert.equal(typeof (new Test($('body'))), 'object');
    });
  });

  describe('vitalize', function() {
    it('should protect multiple vitalize', function() {
      var inited = 0;

      Component.define('test', {
        init: function() {
          inited++;
        }
      });

      Component.vitalize();
      Component.vitalize();

      body('<div data-component="test"></div>');

      assert.equal(inited, 1);
    });

    it('works with multiple blocks on same node', function() {
      var inited = 0;

      Component.define('test', {
        init: function() {
          inited++;
        }
      });

      Component.define('test2', {
        init: function() {
          inited++;
        }
      });

      body('<div data-component="test test2"></div>');

      Component.vitalize();

      assert.equal(inited, 2);
    });
  });

  describe('methods', function() {
    it('init fire after vitalize', function() {
      var inited = 0;

      Component.define('test', {
        init: function() {
          inited = 1;
        }
      });

      body('<div data-component="test"></div>');

      Component.vitalize();

      assert.equal(inited, 1);
    });

    it('_super call parent method', function() {
      var fire = 0;

      Component.define('test', {
        init: function() {
          fire--;
        }
      });

      Component.define('powerTest', 'test', {
        init: function() {
          this._super();
          fire++;
        }
      });

      body('<div data-component="powerTest"></div>');

      Component.vitalize();

      assert.equal(fire, 0);
    });
  });

  describe('props', function() {
    it('should define props', function() {
      var Test = Component.define('test', { a: 1 });
      assert.equal(new Test($('body')).a, 1);
    });

    it('should override inherit props', function() {
      var Test = Component.define('test', { a: 1, b: 2 });
      var PowerTest = Component.define('powerTest', 'test', {
        b: 3
      });

      assert.equal(new PowerTest($('body')).b, 3);
    });

    it('should dont override parent props', function() {
      var Test = Component.define('test', { a: 1, b: 2 });
      var PowerTest = Component.define('powerTest', 'test', {
        b: 3
      });

      assert.equal(new PowerTest($('body')).a, 1);
    });

    it('should dont override parent object props', function() {
      var Test = Component.define('test', { a: 1, b: {
        d: 1
      }});

      var PowerTest = Component.define('powerTest', 'test', { b: {
        f: 1
      }});

      assert.equal(new PowerTest($('body')).b.d, 1);
    });
  });

  describe('events', function() {
    it('should bind events', function() {
      var fire = 0;

      Component.define('test', {
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

      console.log('fire', fire);

      Component.define('test', {
        events: {
          'click on window': 'handler'
        },

        handler: function(e) {
          fire = 1;
          console.log('fire 11111', fire);
        }
      });

      body('<div data-component="test"></div>');

      $(window).trigger('click');

      console.log('fire res', fire);
      assert.equal(fire, 1);
    });

    it('off window handlers after remove', function() {
      var fire = 0;

      Component.define('test', {
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

      Component.define('test', {
        events: {
          'click': 'handler'
        },

        handler: function(e) {
          fire++;
        }
      });

      Component.define('powerTest', 'test', {
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

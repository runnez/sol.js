var Component = require('./../libs/component');

module.exports = Component.define('comments', 'comments.core', {
  init: function() {
    console.log('Comments is inited');
    this._super();
    this.handler('test');
    this.test('bla');
    this.handler('2345');

    console.log(this.el('btn'));
  },

  handler: function(data) {
    console.log('Comments: ', data);
    this._super();
  },

  test: function(data) {
    console.log('Test: ', data);
    this._super();
  }
});

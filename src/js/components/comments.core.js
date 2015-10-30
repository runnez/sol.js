var Component = require('./../libs/component');

module.exports = Component.define('comments.core', {
  events: {
    'click on window': 'handlerClick',
    'click on %btn-stop'
  },

  handlerClick: function(e) {
    console.log(e);
  },

  init: function() {
    console.log('Comments Core is inited');
  },

  handler: function(data) {
    console.log('Core Handler: ', data);
  },

  test: function(data) {
    console.log('Core Test: ', data);
  }
});

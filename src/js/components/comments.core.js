var Component = require('./../component');

module.exports = Component.define('comments.core', {
  events: {
    'click on window': 'handlerClick',
  },

  handlerClick: function() {
    console.log(arguments);
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

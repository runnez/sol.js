var $         = require('jquery');
var Component = require('./libs/component');

/*
  modules:
    render:
    models:
    mvvm:
*/

Component.define('Comments', {
  ajax: true,

  events: {
    'click on .js-delete': function(e) {
      this.$block.remove();
      console.log(this.$block);
    },

    'click on .js-btn': function(e) {
      console.log(e, 'btn', this);
    },

    'resize on window': 'handlerClick',

    'click on window': function() {
      console.log('1');
    }
  },

  handlerClick: function(e) {
    console.log(e);
  },

  init: function() {
    console.log('Comments is inited');
  },

  destroy: function() {
    console.log('Comment is destroyed');
  }
});

Component.define('NewComments', 'Comments', {
  events: {
  },

  init: function() {
    console.log('NewComments is inited');
  }
});

$(document).ready(function() {
  Component.vitalize();
});


var $         = require('jquery');
var Component = require('./libs/component');

Component.define('Comments', {
  ajax: true,

  events: {
    'click on .js-delete': function(e) {
      this.remove();
      console.log(this.$block);
    },

    'click on .js-btn': function(e) {
      this.send();
    },

    'resize on window': 'handlerClick',

    'click on window': function() {
      console.log('1');
    }
  },

  send: function() {
    console.log('send');
  },

  handlerClick: function(e) {
    console.log(e);
  },

  init: function() {
    console.log('Comments is inited');
  }
});

Component.define('NewComments', 'Comments', {
  events: {},

  init: function() {
    console.log('NewComments is inited');
  },

  send: function() {
    this._super();
    console.log('send fuck');
  },
});

$(document).ready(function() {
  Component.vitalize();
});


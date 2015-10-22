var $         = require('jquery');
var Component = require('./libs/component');

Component.define('Comments', {
  ajax: true,

  events: {
    'click on .js-delete': function(e) {
      console.log(this);
    },

    'click on .js-btn': function(e) {
      console.log(e, 'btn', this);
    },

    'click on window': 'handlerClick',

    'remove': function() {
      console.log('remove');
    }
  },

  handlerClick: function(e) {
    console.log(this);
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
    'click on window': function() {
      alert(1111);
    }
  },

  init: function() {
    this._super();
    console.log('NewComments is inited');
  }
});

$(document).ready(function() {
  Component.vitalize();
});


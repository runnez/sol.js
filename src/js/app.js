var $         = require('jquery-browserify');
var Component = require('./libs/component');

Component.define('Comments', {
  ajax: true,

  events: {
    'click on .js-delete': function(e) {

    },

    'click on .js-btn': function(e) {

    },

    'click': 'handler'
  },

  handler: function() {
    alert('1');
  },

  created: function() {
    console.log('Comments is inited');
  },

  destroyed: function() {
    console.log('Comment is destroyed');
  }
});

$(document).ready(function() {
  Component.vitalize();
});


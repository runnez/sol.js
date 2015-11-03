var $         = require('jquery');
var Component = require('./component');

require('./components/comments.core');
require('./components/comments');

$(document).ready(function() {
  Component.vitalize();
});


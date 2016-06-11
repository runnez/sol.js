# Sol.js [![Build Status](https://travis-ci.org/runnez/sol.js.svg)](https://travis-ci.org/runnez/component) [![Code Climate](https://codeclimate.com/github/runnez/component/badges/gpa.svg)](https://codeclimate.com/github/runnez/component)

Tired of spaghetti in your jQuery code?
Meet Sol.js - micro framework for making easy-readable jQuery components.

What’s inside:
- clean syntax
- declarative event mapping
- communicate by events
- smart initialization
- inheritance

### Quik Example

register component

```js
  Sol.component('comments', {
    events: {
      'submit on form': 'send'
    },

    send: function(e, $form) {
      e.preventDefault();

      $.post(
        $form.attr('action'),
        $form.serialize(),
        this.append.bind(this)
      )
    },

    append: function(commentMarkup) {
      this.$('ul').append(commentMarkup)
    }
  })
```

```html
  <div data-component="comments">
    <ul>
      ...
    </ul>
    <form action="/comments">
      ...
    </form>
  </div>
```

### Initialize
vitalize() initializes all registered components

```js
  $(document).on('ready', function() {
    Sol.vitalize()
  })
```

Components are secured from double initialization. That provides us ability to use vitalize repeatedly, for example - after adding dynamic content

```js
  xhr.done(function(response) {
    $('.listing').append(response)
    Sol.vitalize()
  })
```

We can pass properties to components using data-options attribute

```html
  <div data-component="slider" data-options="{ autoSlide: true, directionNav: false }"></div>
```

### Events
Sugar for event mapping. You can hang handlers on component DOM elements or delegate events to elements

```js
  Sol.define('promoBlock', {
    events: {
      'mouseenter': 'sayHello',
      'click on button': 'showMeLove'
    },

    sayHello: function() {},

    showMeLove: function() {}
  })
```

Don’t forget to use window in event mapping

```js
  Sol.define('banner', {
    events: {
      'scroll on window': 'checkVisibility'
    },

    checkVisibility: function() {
      // do something
    }
  })
```

And there is an event «remove». Quite useful when your component adds mark up or outer handlers

```js
  Sol.define('textArea', {
    events: {
      'remove': 'onRemove'
    },

    init: function() {
      this.instance = new MediumEditor(this.$block)
    },

    onRemove: function() {
      this.instance.destroy()
    }
  })
```

### Communications
Here we use custom jQuery events for between-components communication

By the way there are 2 awesome methods for sending events for parent components (dispatch) and for children (broadcast)

```js
  Sol.define('filter', {
    events: {
      'change on :input': 'onChange'
    },

    onChange: function() {
      this.dispatch('filter-state-changed', this.getState())
    }
  })


  Sol.define('ViewList', {
    events: {
      'filter-state-changed': 'onChangeFilter'
    },

    onChangeFilter: function() {
      // updateList
    }
  })
```

### Inherit
More nice stuff: Inheritance between components, properties can be redefined, methods can get wrapped and still call parent methods using _super()

```js
  Sol.define('customComments', 'comments', {
    events: {
      'submit on form': 'send'
    },

    onSubmit: function(e, $el) {
      this._super()
      this.doAnything()
    }
  })
```

### Easy customize

You can expand or redefine standard component methods as you wish

```js
  Sol.use(function(Core, filters) {
    Core.prototype.render = function() {
      Handlebars.compile()
    }
  })
```

Or insert a hook in component initialization

```js
  Sol.use(function(Core, filters) {
    filters.push(function() {

    })
  })
```





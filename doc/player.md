# Players
Players are used to present the given media files to the user.

## Public functions

* `ctor (options, cb)`
  * `options.element` must contain the HTML-`<audio>`-element which this player should control
* `play()`
* `pause()`
* `setCurrentTime(time)`
* `getCurrentTime()`
* `jumpTime(time)`
  * alias for `setCurrentTime(getCurrentTime() + time)`

## Events

None.

# Players
Players are used to present the given media files to the user. Each player has a number of public functions.

* `ctor (options, cb)`
  * `options.element` should contain the ID of the HTML-element to place the actual player in, e.g.: `#player`
* `play()`
* `pause()`
* `setCurrentTime(time)`
* `getCurrentTime()`
* `jumpTime(time)`
  * alias for `setCurrentTime(getCurrentTime() + time)`

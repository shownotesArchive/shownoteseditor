# Players
Players are used to present the given media files to the user. Each player has a number of public functions.

* `init (options, cb)`
* `play()`
* `pause()`
* `setCurrentTime(time)`
* `getCurrentTime()`
* `jumpTime(time)`
  * alias for `setCurrentTime(getCurrentTime() + time)`

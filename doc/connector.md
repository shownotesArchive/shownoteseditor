# Connectors

A connector acts as the backend of shownoteseditor. Its job is it to store notes and possibly sync with a
server of some kind. It has a number of public functions.

* `init (options, cb)`
* `addNote (note, cb)`
  * triggers `noteAdded`-event
* `removeNote  (index, cb)`
  * triggers `noteRemoved`-event
* `editNote (index, newNote, cb)`
  * triggers `noteEdited`-event
* `getNotes (cb)`
* `getNote (index, cb)`
* `addEventReceiver (event, cb)`


Additionally it should fire following events:

* `noteAdded (index, note)`
* `noteRemoved (index, note)`
* `noteEdited (index, note, changed)`

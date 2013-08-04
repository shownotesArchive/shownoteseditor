# Connectors

A connector acts as the backend of shownoteseditor. Its job is it to store notes and possibly sync with a
server of some kind.

## Public functions

* `ctor (options, cb)`
* `addNote (note, cb)`
  * triggers `noteAdded`-event
* `removeNote  (index, cb)`
  * triggers `noteRemoved`-event
* `editNote (index, newNote, cb)`
  * triggers `noteEdited`-event
* `getNotes (cb)`
* `getNote (index, cb)`
* `bind (event, fct)` - MicroEvent
* `unbind (event, fct)` - MicroEvent


## Events

* `noteAdded (index, note)`
* `noteRemoved (index, note)`
* `noteEdited (index, note, changed)`

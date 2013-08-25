# Connectors

A connector acts as the backend of shownoteseditor. Its job is it to store notes and possibly sync with a
server of some kind.

## Public functions

* `ctor (options, cb)`
* `addNote (note,[ parent,] cb)`
  * callback: `function (error, id) {}`
  * triggers `noteAdded`-event
* `removeNote  (id, cb)`
  * triggers `noteRemoved`-event
* `editNote (id, newNote, cb)`
  * triggers `noteEdited`-event
* `getNotes (cb)`
* `getNote (id, cb)`
* `bind (event, fct)` - MicroEvent
* `unbind (event, fct)` - MicroEvent


## Events

* `noteAdded (id, note)`
* `noteRemoved (id, note)`
* `noteEdited (id, note, changed)`

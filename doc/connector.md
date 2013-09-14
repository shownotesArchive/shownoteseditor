# Connectors

A connector acts as the backend of shownoteseditor. Its job is it to store notes and possibly sync with a
server of some kind.

## Static functions
* listDocuments (options, cb)
* getDocument (name, cb)
  * returns the documents content as notes-object

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
* `getFriendlyJson ()`
  * returns all notes in the format described in `note.md`
* `bind (event, fct)` - MicroEvent
* `unbind (event, fct)` - MicroEvent


## Events

* `noteAdded (id, note, parentId)`
* `noteRemoved (id, note)`
* `noteEdited (id, newNote, changed)`

## Options for `memory.js`
```javascript
{
  name: "memory",
  options:
  {
    docname: "",
    save: false | "localStorage",
  }
}
```

# Connectors

A connector acts as the backend of shownoteseditor. Its job is it to store notes and possibly sync with a
server of some kind.

## Static functions
* listDocuments (options, cb)
  * callback: `function (err, docs)`
    * `docs` is an array, see `document.md`
* getDocument (options, docname, cb)
  * callback: `function (err, doc)`, see `document.md`
* createDocument (options, doc, cb)
* deleteDocument (options, docname, cb)
* changeDocument (options, docname, newDoc, cb)
* register (options)

## Static fields
* registration
  * needsRegistration
    * boolean
  * registerFields
    * string-array of needed fields to register
  * loginFields
    * string-array of needed fields to login

## Public functions

* `ctor (options, cb)`
* `addNote (note,[ parent,] cb)`
  * callback: `function (err, id)`
  * triggers `noteAdded`-event
* `removeNote  (id, cb)`
  * callback: `function (err)`
  * triggers `noteRemoved`-event
* `editNote (id, newNote, cb)`
  * callback: `function (err)`
  * triggers `noteEdited`-event
* `getNotes (cb)`
  * callback: `function (err, rootNote)`
    * `rootNote`: empty root-note with sub-notes in `notes` attribute
* `getNote (id, cb)`
  * callback: `function (err, note)`
    * `note`: note without sub-notes
* `getFriendlyJson (cb)`
  * get all notes in the format described in `note.md`
* `bind (event, fct)` - MicroEvent
* `unbind (event, fct)` - MicroEvent


## Events

* `noteAdded (id, note, parentId)`
  * `id`: id of the added note
  * `note`: added note
  * `parentId`: id of the note this note as been added to or `_root`
* `noteRemoved (id, note)`
  * `id`: id of the deleted note
  * `newNote`: deleted note
* `noteEdited (id, newNote, changed)`
  * `newNote`: fully edited note
  * `changed`: array of changed attributes

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

## Options for `firebaseconn.js`
```javascript
{
  name: "firebase",
  options:
  {
    docname: "",
    auth:
    {
      email: "",
      password: ""
    }
  }
}
```

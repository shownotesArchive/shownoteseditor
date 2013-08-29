# List


## Public functions

* `ctor (options, connector, cb)`
  * `options.element` must contain the element to place the list in
* `addNote (note, parent)`
* `removeNote (id)`
* `editNote (id, note)`


## Events

* `editNoteStarted (parent)`
  * `id`: note id
  * `note`: note

* `editNoteFinished (id, element)`
  * `id`: note id
  * `element`: the element to place the editor in

* `addNoteStarted (parentId)`
  * `parentId`: parent note id

* `addNoteFinished (id, element)`
  * `id`: note id
  * `element`: the element to place the editor in

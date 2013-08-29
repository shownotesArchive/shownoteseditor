# List


## Public functions

* `ctor (options, cb)`
  * `options.element` must contain the element to place the list in
* `addNote (id, note, parentId)`
* `removeNote (id)`
* `editNote (id, newNote)`


## Events

* `editRequested (id, element, editEnded)`
  * `id`: note id
  * `element`: the element to place the editor in
  * `editEndend`: callback to be called once the user finished the editing

* `removeRequested (id)`
  * `id`: note id

* `addRequested (parentId, element, addEnded)`
  * `parentId`: parent note id
  * `element`: the element to place the editor in
  * `addEndend`: callback to be called once the user finished the adding

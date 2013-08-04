# Editor
An editor represents an interface for the user to edit a single note. It should make it possible to add or edit the
text and timestamp of a given note.

## Public functions

* `ctor (options, cb)`
  * `options.element` must contain the element to place this editor in
  * `options.id` should contain an ID to identify this editor later
* `close ()`
* `getContent ()`
  * returns an object in the form: `{ text: '', time: 1234567890 }`

## Events

* `contentChanged (id, content)`
  * `id`: ID given in `ctor`
  * `content`: see `getContent ()`

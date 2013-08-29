# Editor
An editor represents an interface for the user to edit a single note. It should make it possible to add or edit the
text and timestamp of a given note.

## Public functions

* `ctor (options, player, cb)`
  * `options.element` must contain the element to place this editor in
  * `options.id` should contain an ID to identify this editor later
  * `options.content.time` can contain the time to show initially
  * `options.content.text` can contain the text to show initially
* `close ()`
* `getContent ()`
  * returns an note-object, see `note.md`
* `setContent (content)`
  * sets the content according to an note-object, see `note.md`

## Events

* `contentChanged (id, content)`
  * `id`: ID given in `ctor`
  * `content`: see `getContent ()`

* `submitted (id, content)`
  * `id`: ID given in `ctor`
  * `content`: see `getContent ()`

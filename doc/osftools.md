# osftools

## cloneNote (note, includeChildren)
Creates an object that has the same values for all valide note-attributes as the given note.
If `includeChildren` is true, this is done for all sub-notes, too.

## notesEqual (note1, note2)
Checks if the values of `note1` and `note2` equal. The order of tags is honored.

## sortNotes (notes)
Sorts the notes in `notes` and all sub-notes based on thier `time` value.

## countNotes (notes)
Returns the total count of the array `notes` all all its sub-notes.

## parseNotes (osf)
Parses a number of notes in OSF-Format.

## parseNote (osf)
Parses an note in OSF-Format, returns the note as defined in `note.md`.

## osfNotes (notes)
Converts a number of notes to OSF-Format.

## osfNote (note)
Convert an note as defined in `note.md` to OSF-Format.

## osfTags (tags)
Convert an array of tags to their string representation.

## normalizeTags (tags)
Converts shorttags to longtags. E.g.: `c` => `chapter`.

## toHumanTime (time)
Converts from human time (`HH:MM:SS` or `MM:SS`) to seconds.

## fromHumanTime (humantime)
Converts from seconds to human time.

## diffNotes (note1, note2)
Returns all attributes that are different between the two given notes

## getKeys (...)
Returns all attributes that exist in all given objects

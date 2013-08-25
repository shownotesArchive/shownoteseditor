(function ()
{
  var self = {};

  shownoteseditor.connectors.memory = function (options, cb)
  {
    console.log("memory init", options);

    this.notes = { notes: {} };

    cb();
  };

  self.addNote = function (note, parent, cb)
  {
    if(parent instanceof Function)
    {
      cb = parent;
      parent = "_root";
    }

    note.notes = {};

    var parentNote = this.findParent(parent);
    var id = generateUuid();
    parentNote.notes[id] = note;

    cb(null, id);
    this.trigger('noteAdded', id, note);
  };

  self.removeNote = function (id, cb)
  {
    var parentNote = this.findParent(id);
    if(!parentNote)
      return cb("not found");
    var note = parentNote.notes[id];
    delete parentNote.notes[id];

    cb();
    this.trigger('noteRemoved', id, note);
  };

  self.editNote = function (id, newNote, cb)
  {
    var parentNote = this.findParent(id);
    if(!parentNote)
      return cb("not found");
    var oldNote = parentNote.notes[id];

    var keys = getKeys(oldNote, newNote);

    var changed = keys.filter(
      function (key)
      {
        return oldNote[key] != newNote[key] && key != "notes";
      }
    );

    for (var i = 0; i < changed.length; i++)
    {
      var change = changed[i];
      parentNote.notes[id][change] = newNote[change];
    }

    cb();
    this.trigger('noteEdited', id, newNote, changed);
  };

  self.getNotes = function (cb)
  {
    cb(null, this.notes);
  };

  self.getNote = function (id, cb)
  {
    var parentNote = this.findParent(id);
    if(!parentNote)
      return cb("not found");
    cb(null, parentNote.notes[id]);
  };

  function getKeys()
  {
    var keys = [];

    for (var i = 0; i < arguments.length; i++)
    {
      var arg = arguments[i];
      var argKeys = Object.keys(arg);

      for (var j = 0; j < argKeys.length; j++)
      {
        var argKey = argKeys[j];

        if(keys.indexOf(argKey) == -1)
          keys.push(argKey);
      }
    }

    return keys;
  }

  self.findParent = function (id, note)
  {
    if(id == "_root")
      return this.notes;
    if(!note)
      note = this.notes;

    var subnotes = Object.keys(note.notes);

    for (var i = 0; i < subnotes.length; i++)
    {
      var subid = subnotes[i];

      if(subid == id)
        return note;

      var foundNote = this.findParent(id, note.notes[subid]);

      if(foundNote != null)
        return foundNote;
    }

    return null;
  };

  // http://www.broofa.com/Tools/Math.uuid.js, MIT
  function generateUuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,
      function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
      }
    );
  };

  shownoteseditor.connectors.memory.prototype = self;
  MicroEvent.mixin(shownoteseditor.connectors.memory);
})();

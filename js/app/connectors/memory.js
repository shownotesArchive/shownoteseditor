(function ()
{
  var self = {};

  shownoteseditor.connectors.memory = function (options, cb)
  {
    console.log("memory init", options);

    this.notes = { notes: {} };
    this.docname = options.docname;
    this.save = options.save || false;
  };

  self.addNote = function (note, parent, cb)
  {
    if(parent instanceof Function)
    {
      cb = parent;
      parent = "_root";
    }

    note = osftools.cloneNote(note, false);

    var parentNote;
    note.notes = {};

    if(parent == "_root")
    {
      parentNote = this.notes;
    }
    else
    {
      parentNote = this.findParent(parent); // parent of parent
      if(!parentNote)
        return cb("parent not found");
      parentNote = parentNote.notes[parent]; // parent
    }

    var id = generateUuid();
    parentNote.notes[id] = note;

    this.trigger('noteAdded', id, osftools.cloneNote(note, false), parent);
    this.doSave();
    cb(null, id);
  };

  self.removeNote = function (id, cb)
  {
    var parentNote = this.findParent(id);
    if(!parentNote)
      return cb("not found");
    var note = osftools.cloneNote(parentNote.notes[id], false);
    delete parentNote.notes[id];

    cb();
    this.doSave();
    this.trigger('noteRemoved', id, note);
  };

  self.editNote = function (id, newNote, cb)
  {
    var parentNote = this.findParent(id);
    if(!parentNote)
      return cb("not found");
    newNote = osftools.cloneNote(newNote, false);
    var oldNote = parentNote.notes[id];

    var keys = getKeys(oldNote, newNote);

    var changed = keys.filter(
      function (key)
      {
        if(key == "notes")
          return false;

        if(newNote[key] instanceof Array)
        {
          if(!(oldNote[key] instanceof Array))
            return false;
          if(oldNote[key].length != newNote[key].length)
            return false;

          for (var i = 0; i < oldNote[key].length; i++)
          {
            if(oldNote[key][i] != newNote[key][i])
              return true;
          }

          return false;
        }
        else if(oldNote[key] != newNote[key])
        {
          return true;
        }

        return false;
      }
    );

    for (var i = 0; i < changed.length; i++)
    {
      var change = changed[i];
      parentNote.notes[id][change] = newNote[change];
    }

    this.trigger('noteEdited', id, newNote, changed);
    this.doSave();
    cb();
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
    cb(null, osftools.cloneNote(parentNote.notes[id], false));
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
  };

  self.getFriendlyJson = function (note)
  {
    if(!note)
    {
      note = this.notes;
    }

    var notes = [];

    for (var id in note.notes)
    {
      var snote = note.notes[id];
      var fnote =
      {
        time: snote.time,
        text: snote.text,
        tags: snote.tags,
        notes: this.getFriendlyJson(snote)
      };

      notes.push(fnote);
    }

    return notes;
  };

  self.findParent = function (id, note)
  {
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

  self.doSave = function ()
  {
    if(this.save == "localStorage")
    {
      var json = this.getFriendlyJson();
      localStorage.setItem("sne_memory_doc_" + this.docname, JSON.stringify(json));
    }
  };

  self.doLoad = function (cb)
  {
    if(this.save == "localStorage")
    {
      var json = localStorage.getItem("sne_memory_doc_" + this.docname);
      var notes = JSON.parse(json);
      var that = this;

      async.series(
        [
          function (cb)
          {
            shownoteseditor.utils.clearNotes(that, cb);
          },
          function (cb)
          {
            shownoteseditor.utils.loadNotes(that, notes, cb);
          }
        ],
        cb
      );
    }
    else
    {
      cb();
    }
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

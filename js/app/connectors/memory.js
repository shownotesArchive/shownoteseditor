(function ()
{
  var self = {};

  shownoteseditor.connectors.memory = function (options, cb)
  {
    console.log("memory init", options);

    this.notes = [];
    this.events =
    {
      "noteAdded": [],   // (index, note)
      "noteRemoved": [], // (index, note)
      "noteEdited": []   // (index, note, changed)
    };

    cb();
  };

  self.addNote = function (note, cb)
  {
    this.notes.push(note);

    cb();
    this.triggerEvent('noteAdded', [this.notes.length - 1, note]);
  };

  self.removeNote = function (index, cb)
  {
    if(index < 0 || index >= this.notes.length)
      return cb("Invalid index");

    var note = this.notes[index];
    this.notes.splice(index, 1);

    cb();
    this.triggerEvent('noteRemoved', [index, note]);
  };

  self.editNote = function (index, newNote, cb)
  {
    if(index < 0 || index >= this.notes.length)
      return cb("Invalid index");

    var oldNote = this.notes[index];
    var keys = getKeys(oldNote, newNote);

    var changed = keys.filter(
      function (key)
      {
        return oldNote[key] != newNote[key];
      }
    );

    this.notes[index] = newNote;

    cb();
    this.triggerEvent('noteEdited', [index, newNote, changed]);
  };

  self.getNotes = function (cb)
  {
    cb(null, this.notes);
  };

  self.getNote = function (index, cb)
  {
    if(index < 0 || index >= this.notes.length)
      return cb("Invalid index");

    cb(null, this.notes[index]);
  };

  self.addEventReceiver = function (event, cb)
  {
    if(Object.keys(this.events).indexOf(event) == -1)
      throw "Unknown Event";

    this.events[event].push(cb);
  };

  self.triggerEvent = function (event, args)
  {
    if(Object.keys(this.events).indexOf(event) == -1)
      throw "Unknown Event";

    for (var i = 0; i < this.events[event].length; i++)
    {
      var cb = this.events[event][i];
      cb.apply(null, args);
    }
  }

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

  shownoteseditor.connectors.memory.prototype = self;
})();

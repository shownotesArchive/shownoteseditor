(function ()
{
  var self = {};
  var notes = [];
  var events =
  {
    "noteAdded": [],   // (index, note)
    "noteRemoved": [], // (index, note)
    "noteEdited": []   // (index, note, changed)
  };

  self.init = function (options, cb)
  {
    console.log("memory init", options);
    cb();
  };

  self.addNote = function (note, cb)
  {
    notes.push(note);

    cb();
    triggerEvent('noteAdded', [notes.length - 1, note]);
  };

  self.removeNote = function (index, cb)
  {
    if(index < 0 || index >= notes.length)
      return cb("Invalid index");

    var note = notes[index];
    notes.splice(index, 1);

    cb();
    triggerEvent('noteRemoved', [index, note]);
  };

  self.editNote = function (index, newNote, cb)
  {
    if(index < 0 || index >= notes.length)
      return cb("Invalid index");

    var oldNote = notes[index];
    var keys = getKeys(oldNote, newNote);

    var changed = keys.filter(
      function (key)
      {
        return oldNote[key] != newNote[key];
      }
    );

    notes[index] = newNote;

    cb();
    triggerEvent('noteEdited', [index, newNote, changed]);
  };

  self.getNotes = function (cb)
  {
    cb(null, notes);
  };

  self.getNote = function (index, cb)
  {
    if(index < 0 || index >= notes.length)
      return cb("Invalid index");

    cb(null, notes[index]);
  };

  self.addEventReceiver = function (event, cb)
  {
    if(Object.keys(events).indexOf(event) == -1)
      throw "Unknown Event";

    events[event].push(cb);
  };

  function triggerEvent(event, args)
  {
    if(Object.keys(events).indexOf(event) == -1)
      throw "Unknown Event";

    for (var i = 0; i < events[event].length; i++)
    {
      var cb = events[event][i];
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

  shownoteseditor.connectors.memory = self;
})();

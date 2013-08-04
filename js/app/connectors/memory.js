(function ()
{
  var self = {};

  shownoteseditor.connectors.memory = function (options, cb)
  {
    console.log("memory init", options);

    this.notes = [];

    cb();
  };

  self.addNote = function (note, cb)
  {
    this.notes.push(note);

    cb();
    this.trigger('noteAdded', this.notes.length - 1, note);
  };

  self.removeNote = function (index, cb)
  {
    if(index < 0 || index >= this.notes.length)
      return cb("Invalid index");

    var note = this.notes[index];
    this.notes.splice(index, 1);

    cb();
    this.trigger('noteRemoved', index, note);
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
    this.trigger('noteEdited', index, newNote, changed);
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
  MicroEvent.mixin(shownoteseditor.connectors.memory);
})();

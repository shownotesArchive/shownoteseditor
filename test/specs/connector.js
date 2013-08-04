(function ()
{
  var connector;
  var connectorName = "memory";

  module("connector",
    {
      setup: function()
      {
        var con = shownoteseditor.connectors[connectorName];
        connector = new con({}, function (){});
      },
      teardown: function()
      {
        connector = null;
      }
    }
  );

  asyncTest("addNote callback",
    function ()
    {
      connector.addNote({},
        function ()
        {
          ok(true);
          start();
        }
      );
    }
  );

  asyncTest("addNote event",
    function ()
    {
      var addNote = { a: "b" };
      var called = false;

      connector.bind("noteAdded",
        function (index, note)
        {
          if(called)
          {
            console.error("addNote callback called twice")
            ok(false);
          }

          called = true;
          equal(index, 0, "event - index ok");
          deepEqual(note, addNote, "event - note ok");
          start();
        }
      );

      connector.addNote(addNote, function () {});
    }
  );

  asyncTest("addNote",
    function ()
    {
      var note = { a: "b" };

      connector.addNote(note,
        function ()
        {
          connector.getNotes(function (err, notes)
            {
              equal(notes.length, 1, "One note added");
              deepEqual(notes[0], note, "Right note added");
            }
          );

          start();
        }
      );
    }
  );

  asyncTest("removeNote callback",
    function ()
    {
      connector.addNote({ a: "b3" },
        function (err)
        {
          connector.removeNote(0,
            function ()
            {
              ok(true);
              start();
            }
          );
        }
      );
    }
  );

  asyncTest("removeNote event",
    function ()
    {
      var addNote = { a: "b" };
      var called = false;

      connector.bind("noteRemoved",
        function (index, note)
        {
          if(called)
          {
            console.error("removeNote callback called twice")
            ok(false);
          }

          called = true;
          equal(index, 0, "event - index ok");
          deepEqual(note, addNote, "event - note ok");
          start();
        }
      );

      connector.addNote(addNote,
        function (err)
        {
          connector.removeNote(0, function () {});
        }
      );
    }
  );

  asyncTest("removeNote",
    function ()
    {
      var addNotes =
        [
          { a: "b1" },
          { a: "b2" },
          { a: "b3" }
        ];

      async.series(
        [
          function (cb)
          {
            async.each(addNotes, connector.addNote.bind(connector), cb);
          },
          function (cb)
          {
            connector.removeNote(1, cb); // remove b2
          },
          function (cb)
          {
            connector.getNotes(function (err, notes)
              {
                equal(notes.length, 2, "Note removed");
                equal(addNotes[0], notes[0], "Note 1 untouched");
                equal(addNotes[2], notes[1], "Note 3 untouched");
                cb();
              }
            );
          }
        ],
        start
      );
    }
  );

  asyncTest("removeNote - invalid index",
    function ()
    {
      connector.bind("noteRemoved",
        function (index, note)
        {
          ok(false, "Event fired");
        }
      );

      connector.removeNote(1,
        function (err)
        {
          equal(err, "Invalid index", "Error ok");
          start();
        }
      );
    }
  );

  asyncTest("editNote callback",
    function ()
    {
      connector.addNote({},
        function ()
        {
          connector.editNote(0, { a: "b" },
            function ()
            {
              ok(true);
              start();
            }
          );
        }
      );
    }
  );

  asyncTest("editNote event",
    function ()
    {
      var addNote = { a: "val1", b: "val2" };
      var editedNote = { a: "val1", b: "newVal2" };
      var called = false;

      connector.bind("noteEdited",
        function (index, note, changed)
        {
          if(called)
          {
            console.error("editNote callback called twice")
            ok(false);
          }

          called = true;
          equal(index, 0, "event - index ok");
          deepEqual(note, editedNote, "event - note ok");
          deepEqual(changed, ["b"], "event - changed ok");
          start();
        }
      );

      connector.addNote(addNote,
        function ()
        {
          connector.editNote(0, editedNote, function () {});
        }
      );
    }
  );

  asyncTest("editNote",
    function ()
    {
      var addNote = { a: "val1", b: "val2" };
      var editedNote = { a: "val1", b: "newVal2" };

      connector.addNote(addNote,
        function (err)
        {
          connector.editNote(0, editedNote,
            function (err)
            {
              connector.getNotes(function (err, notes)
                {
                  deepEqual(notes[0], editedNote, "Note changed");
                  start();
                }
              );
            }
          );
        }
      );
    }
  );

  asyncTest("editNote - invalid index",
    function ()
    {
      connector.bind("noteEdited",
        function (index, note)
        {
          ok(false, "Event fired");
        }
      );

      connector.editNote(1, {},
        function (err)
        {
          equal(err, "Invalid index", "Error ok");
          start();
        }
      );
    }
  );

  asyncTest("getNote",
    function ()
    {
      var addNote = { a: "val1", b: "val2" };

      connector.addNote(addNote,
        function (err)
        {
          connector.getNote(0,
            function (err, note)
            {
              deepEqual(addNote, note, "Right note returned");
              start();
            }
          );
        }
      );
    }
  );

  asyncTest("getNote - invalid index",
    function ()
    {
      connector.getNote(1,
        function (err)
        {
          equal(err, "Invalid index", "Error ok");
          start();
        }
      );
    }
  );
})();

(function ()
{
  var connector;
  var connectorInfo = { name: "memory", isSynced: false };

  module("connector",
    {
      setup: function()
      {
        var con = shownoteseditor.connectors[connectorInfo.name];
        connector = new con({}, function (){});
      },
      teardown: function()
      {
        connector = null;
      }
    }
  );

  test("findParent - basic",
    function ()
    {
      var root = { notes: {} };
      connector.findParent("", root);
      ok(true);
    }
  );

  test("findParent - 1 deep",
    function ()
    {
      var root = { notes: { "a": { notes: {} } } };
      var parent = connector.findParent("a", root);
      equal(parent, root);
    }
  );

  test("findParent - 2 deep",
    function ()
    {
      var innerNote = { notes: { "b": { notes: {} } } };
      var root = { notes: { "a": innerNote  } };

      var parent = connector.findParent("b", root);
      deepEqual(parent, innerNote);
    }
  );

  test("findParent - not found",
    function ()
    {
      var root = { notes: { "a": { notes: { } }  } };

      var parent = connector.findParent("b", root);
      equal(parent, null);
    }
  );

  test("findParent - multiple",
    function ()
    {
      var innerNote = { notes: { "c": { notes: {} }, "b": { notes: {} } } };
      var root = { notes: { "a": innerNote  } };

      var parent = connector.findParent("b", root);
      deepEqual(innerNote, parent);
    }
  );

  asyncTest("addNote callback",
    function ()
    {
      connector.addNote({},
        function (err, id)
        {
          ok(!err);
          ok(id);
          start();
        }
      );
    }
  );

  asyncTest("addNote event - root",
    function ()
    {
      var addNote = { time: 0, tags: [], text: "b" };
      var called = false;

      connector.bind("noteAdded",
        function (index, note, parentId)
        {
          if(called)
          {
            console.error("addNote event called twice")
            ok(false);
          }

          called = true;
          ok(index, "event - id");
          deepEqual(note, addNote, "event - note ok");
          equal(parentId, "_root", "event - parentId ok");
          start();
        }
      );

      connector.addNote(addNote, function () {});
    }
  );

  asyncTest("addNote event - invalid parent",
    function ()
    {
      connector.addNote({}, "foo",
        function (err)
        {
          equal(err, "parent not found");
          start();
        }
      );
    }
  );

  asyncTest("addNote event - deep",
    function ()
    {
      var addNote1 = { time: 0, tags: [], text: "b1" };
      var addNote2 = { time: 0, tags: [], text: "b2" };
      var called = 0;
      var outerId;

      connector.bind("noteAdded",
        function (index, note, parentId)
        {
          called++;

          if(called == 1)
          {
            // skip first note
            return;
          }
          else if(called > 2)
          {
            console.error("addNote event called trice or more")
            ok(false);
          }

          ok(index, "event - id");
          deepEqual(note, addNote2, "event - note ok");
          equal(parentId, outerId, "event - parentId ok");
          start();
        }
      );

      connector.addNote(addNote1,
        function (err, id)
        {
          outerId = id;
          connector.addNote(addNote2, id, function () {});
        }
      );
    }
  );

  asyncTest("addNote - 1 deep",
    function ()
    {
      var note = { time: 0, tags: [], text: "b" };

      connector.addNote(note,
        function (err, id)
        {
          connector.getNote(id, function (err, gotNote)
            {
              deepEqual(gotNote, note, "Right note added");
              start();
            }
          );
        }
      );
    }
  );

  asyncTest("addNote - 2 deep",
    function ()
    {
      var outerNote = { time: 0, tags: [], text: "b1" };
      var innerNote = { time: 0, tags: [], text: "b2" };
      var outerId;
      var innerId;

      async.series(
        [
          function (cb)
          {
            connector.addNote(outerNote,
              function (err, id)
              {
                outerId = id;
                cb(err);
              }
            );
          },
          function (cb)
          {
            connector.addNote(innerNote, outerId,
              function (err, id)
              {
                innerId = id;
                cb(err);
              }
            );
          },
          function (cb)
          {
            connector.getNotes(function (err, notes)
              {
                var root;

                root = notes.notes;
                var keys = Object.keys(root);
                equal(keys.length, 1, "level 1 - One note added");
                deepEqual(root[outerId].text, outerNote.text, "level 1 - Right note added");

                root = notes.notes[outerId].notes;
                var keys = Object.keys(root);
                equal(keys.length, 1, "level 2 - One note added");
                deepEqual(root[innerId].text, innerNote.text, "level 2 - Right note added");

                cb();
              }
            );
          }
        ],
        start
      );
    }
  );

  asyncTest("removeNote callback",
    function ()
    {
      connector.addNote({ a: "b3", notes: {} },
        function (err, id)
        {
          connector.removeNote(id,
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
      var addNote = { time: 0, tags: [], text: "b" };
      var called = false;
      var addedId = null;

      connector.bind("noteRemoved",
        function (id, note)
        {
          if(called)
          {
            console.error("removeNote callback called twice")
            ok(false);
          }

          called = true;
          equal(id, addedId, "event - index ok");
          deepEqual(note, addNote, "event - note ok");
          start();
        }
      );

      connector.addNote(addNote,
        function (err, id)
        {
          addedId = id;
          connector.removeNote(id, function () {});
        }
      );
    }
  );

  asyncTest("removeNote",
    function ()
    {
      var addNotes =
        [
          { time: 0, tags: [], text: "b1", notes: {} },
          { time: 0, tags: [], text: "b2" },
          { time: 0, tags: [], text: "b3", notes: {} }
        ];

      var ids = [];

      async.series(
        [
          function (cb)
          {
            async.eachSeries(addNotes,
              function (note, cb)
              {
                connector.addNote.call(connector,
                  note,
                  function (err, id)
                  {
                    ids.push(id);
                    cb();
                  }
                );
              },
              cb);
          },
          function (cb)
          {
            connector.removeNote(ids[1], cb); // remove b2
          },
          function (cb)
          {
            connector.getNotes(function (err, notes)
              {
                var keys = Object.keys(notes.notes);
                equal(keys.length, 2, "Note removed");
                deepEqual(notes.notes[keys[0]], addNotes[0], "Note 1 untouched");
                deepEqual(notes.notes[keys[1]], addNotes[2], "Note 3 untouched");
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

      connector.removeNote("foo",
        function (err)
        {
          equal(err, "not found", "Error ok");
          start();
        }
      );
    }
  );

  asyncTest("editNote callback",
    function ()
    {
      connector.addNote({},
        function (err, id)
        {
          connector.editNote(id, { a: "b" },
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
      var addNote = { time: 0, tags: [], text: "val1" };
      var editedNote = { time: 0, tags: [], text: "val2" };
      var called = false;
      var addedId = null;

      connector.bind("noteEdited",
        function (id, note, changed)
        {
          if(called)
          {
            console.error("editNote callback called twice")
            ok(false);
          }

          called = true;
          equal(id, addedId, "event - id ok");
          deepEqual(note, editedNote, "event - note ok");
          deepEqual(changed, ["text"], "event - changed ok");
          start();
        }
      );

      connector.addNote(addNote,
        function (err, id)
        {
          addedId = id;
          connector.editNote(id, editedNote, function () {});
        }
      );
    }
  );

  asyncTest("editNote",
    function ()
    {
      var addNote = { time: 0, tags: [], text: "val1" };
      var editedNote = { time: 0, tags: [], text: "val2" };

      connector.addNote(addNote,
        function (err, id)
        {
          connector.editNote(id, editedNote,
            function (err)
            {
              connector.getNote(id, function (err, note)
                {
                  deepEqual(note, editedNote, "Note changed");
                  start();
                }
              );
            }
          );
        }
      );
    }
  );

  asyncTest("editNote - invalid id",
    function ()
    {
      connector.bind("noteEdited",
        function (id, note)
        {
          ok(false, "Event fired");
        }
      );

      connector.editNote(1, {},
        function (err)
        {
          equal(err, "not found", "Error ok");
          start();
        }
      );
    }
  );

  asyncTest("getNote",
    function ()
    {
      var addNote = { time: 0, tags: [], text: "val1" };

      connector.addNote(addNote,
        function (err, id)
        {
          connector.getNote(id,
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

  asyncTest("getNote - invalid id",
    function ()
    {
      connector.getNote("foo",
        function (err)
        {
          equal(err, "not found", "Error ok");
          start();
        }
      );
    }
  );

  test("getFriendlyJson",
    function ()
    {
      var input = {
        "notes":
        {
          "aaa":
          {
            "time": 20,
            "text": "a",
            "tags": [ "a", "b" ],
            "notes":
            {
              "aaa.1":
              {
                "time": 30,
                "text": "b",
                "tags": [],
                "notes": {}
              }
            }
          },
          "bbb":
          {
            "time": 40,
            "text": "c",
            "tags": [ "a", "b" ],
            "notes": {}
          }
        }
      };

      var expected = [
        {
          "time": 20,
          "text": "a",
          "tags": [ "a", "b" ],
          "notes":
            [
              {
                "time": 30,
                "text": "b",
                "tags": [],
                "notes": []
              }
            ]
        },
        {
          "time": 40,
          "text": "c",
          "tags": [ "a", "b" ],
          "notes": []
        }
      ];

      var actual = connector.getFriendlyJson(input);

      deepEqual(actual, expected);
    }
  );
})();

(function ()
{
  module("utils");

  var loadNotes_cases  = [
    {
      title: "Single note",
      notes: [
        { "time": 40, "text": "c", "link": "", "tags": [] }
      ],
      expectedCalls:[
        [{"time":40,"text":"c","link":"","tags":[]},"_root",null]
      ]
    },
    {
      title: "Two notes",
      notes: [
        { "time": 40, "text": "a", "link": "", "tags": [] },
        { "time": 40, "text": "b", "link": "", "tags": [] }
      ],
      expectedCalls:[
        [{"time":40,"text":"a","link":"","tags":[]},"_root",null],
        [{"time":40,"text":"b","link":"","tags":[]},"_root",null]
      ]
    },
    {
      title: "Sub-Note - one lvl",
      notes: [
        {
          "time": 20, "text": "a", "link": "", "tags": [],
          "notes": [ { "time": 30, "text": "b", "link": "", "tags": [] } ]
        }
      ],
      expectedCalls:[
        [{"time":20,"text":"a","link":"","tags":[]},"_root",null],
        [{"time":30,"text":"b","link":"","tags":[]},"a",null]
      ]
    },
    {
      title: "Sub-Note - two lvls",
      notes: [
        {
          "time": 20, "text": "a", "tags": [],
          "notes":
            [
              {
                "time": 30, "text": "b", "tags": [],
                "notes": [ { "time": 40, "text": "c", "tags": [] } ]
              }
            ]
        }
      ],
      expectedCalls:[
        [{"time":20,"text":"a","link":"","tags":[]},"_root",null],
        [{"time":30,"text":"b","link":"","tags":[]},"a",null],
        [{"time":40,"text":"c","link":"","tags":[]},"b",null]
      ]
    },
  ];

  QUnit.cases(loadNotes_cases).asyncTest("loadNotes",
    function (params)
    {
      var currentCall = 0;
      var fakeConnector = {
        addNote : function ()
        {
          var args = Array.prototype.slice.call(arguments);
          var cb = args[args.length - 1];
          args[0] = osftools.cloneNote(args[0], false);
          var note = args[0];
          args[args.length - 1] = null;

          deepEqual(args, params.expectedCalls[currentCall]);
          currentCall++;

          cb(null, note.text); // call callback
        }
      };

      shownoteseditor.utils.loadNotes(fakeConnector, params.notes,
        function ()
        {
          start();
        }
      );
    }
  );
})();

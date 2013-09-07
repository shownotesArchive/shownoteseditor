(function ()
{
  module("osftools",
    {
    }
  );

  var cloneNoteData = [
    {
      title: "Single note",
      noteIn: { text: "a", time: 1, tags: ["a"] },
    },
    {
      title: "Text gets added",
      noteIn: { time: 0, tags: ["a"] },
      noteOut: { text: "", time: 0, tags: ["a"] }
    },
    {
      title: "Time gets added",
      noteIn: { text: "a", tags: ["a"] },
      noteOut: { text: "a", time: 0, tags: ["a"] }
    },
    {
      title: "Tags gets added",
      noteIn: { text: "a", time: 0 },
      noteOut: { text: "a", time: 0, tags: [] }
    },
    {
      title: "Subnote - 1 lvl",
      subNotes: true,
      noteIn: { text: "a", time: 0, tags: [], notes: [ { text: "b", time: 0, tags: [], notes: [] } ] }
    },
    {
      title: "Subnote - 2 lvl",
      subNotes: true,
      noteIn: { text: "a", time: 0, tags: [], notes: [ { text: "b", time: 0, tags: [], notes: [ { text: "b", time: 0, tags: [], notes: [] } ] } ] }
    },
    {
      title: "Subnote - subNotes=false",
      subNotes: false,
      noteIn: { text: "a", time: 0, tags: [], notes: [ { text: "b", time: 0, tags: [], notes: [] } ] },
      noteIn: { text: "a", time: 0, tags: [] }
    }
  ];

  QUnit.cases(cloneNoteData).test("cloneNote",
    function (params)
    {
      if(!params.noteOut)
        params.noteOut = params.noteIn;

      var actual = osftools.cloneNote(params.noteIn, params.subNotes);
      deepEqual(actual, params.noteOut);
      notStrictEqual(actual, params.noteOut);
    }
  );

  var normalizeTagsData =
    [
      { title: "#c => #chapter", input: [ "c" ], output: [ "chapter" ] },
      { title: "#q => #quote", input: [ "q" ], output: [ "quote" ] },
      { title: "#foo => #foo", input: [ "foo" ], output: [ "foo" ] },
      { title: "#foo #c => #foo #chapter", input: [ "foo", "c" ], output: [ "foo", "chapter" ] }
    ];

  QUnit.cases(normalizeTagsData).test("normalizeTags",
    function (params)
    {
      var actual = osftools.normalizeTags(params.input);
      deepEqual(actual, params.output);
    }
  );

  var osfTagsData =
  [
    { title: "One tag", input: [ "a" ], output: "#a" },
    { title: "Two tags", input: [ "a" ], output: "#a" },
  ];

  QUnit.cases(osfTagsData).test("osfTags",
    function (params)
    {
      var actual = osftools.osfTags(params.input);
      equal(actual, params.output);
    }
  );

  var humanTimeData =
  [
    { human: "00:00", machine: 0 },
    { human: "01:01", machine: 61 },
    { human: "00:22", machine: 22 },
    { human: "02:01", machine: 121 },
    { human: "00:00:00", machine: 0 },
    { human: "01:01:01", machine: 3661 },
    { human: "01:01:22", machine: 3682 },
    { human: "02:01:01", machine: 7261 }
  ];

  for (var i = 0; i < humanTimeData.length; i++)
    humanTimeData[i].title = humanTimeData[i].human + " => " + humanTimeData[i].machine;

  QUnit.cases(humanTimeData).test("fromHumanTime",
    function (params)
    {
      var actual = osftools.fromHumanTime(params.human);
      strictEqual(actual, params.machine);
    }
  );

  for (var i = 0; i < humanTimeData.length; i++)
  {
    if(humanTimeData[i].human.length == 5)
      humanTimeData[i].human = "00:" + humanTimeData[i].human;
    humanTimeData[i].title = humanTimeData[i].machine + " => " + humanTimeData[i].human;
  }

  QUnit.cases(humanTimeData).test("toHumanTime",
    function (params)
    {
      var actual = osftools.toHumanTime(params.machine);
      strictEqual(actual, params.human);
    }
  );

  var noteData =
  [
    {
      title: "Note without time",
      osf: "foo",
      json: false
    },
    {
      title: "Note with machine time and text",
      osf: "0 foo",
      json: { time: 0, text: "foo", tags: [] }
    },
    {
      title: "Note with hierarchy 1",
      hierarchy: true,
      osf: "0 - foo",
      json: { time: 0, text: "foo", tags: [], hierarchy: 1 }
    },
    {
      title: "Note with hierarchy 2",
      hierarchy: true,
      osf: "0 -- foo",
      json: { time: 0, text: "foo", tags: [], hierarchy: 2 }
    },
    {
      title: "Note with human time and text",
      osf: "01:12:00 foo",
      json: { time: 4320, text: "foo", tags: [] }
    },
    {
      title: "Note with one tag",
      osf: "0 foo #a",
      json: { time: 0, text: "foo", tags: [ "a" ] }
    },
    {
      title: "Note with two tags",
      osf: "0 foo #a #b",
      json: { time: 0, text: "foo", tags: [ "a", "b" ] }
    },
    {
      title: "Note with with machine time and two tags",
      osf: "42 foo #a #b",
      json: { time: 42, text: "foo", tags: [ "a", "b" ] }
    },
    {
      title: "Note with with human time and two tags",
      osf: "01:12:00 foo #a #b",
      json: { time: 4320, text: "foo", tags: [ "a", "b" ] }
    }
  ];

  QUnit.cases(noteData).test("parseNote",
    function (params)
    {
      var actual = osftools.parseNote(params.osf, params.hierarchy);
      deepEqual(actual, params.json);
    }
  );

  var osfNoteData =
  [
    {
      title: "Note without tags",
      osf: "01:12:00 foo",
      json: { time: 4320, text: "foo", tags: [] }
    },
    {
      title: "Note with tags",
      osf: "01:12:00 foo #a #b",
      json: { time: 4320, text: "foo", tags: [ "a", "b" ] }
    }
  ];

  QUnit.cases(osfNoteData).test("osfNote",
    function (params)
    {
      var actual = osftools.osfNote(params.json);
      equal(actual, params.osf);
    }
  );

  var osfNotesData_json = [
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

  var osfNotesData_osf =
      "00:00:20 a #a #b\n"
    + "00:00:30 - b\n"
    + "00:00:40 c #a #b\n";

  test("osfNotes",
    function ()
    {
      var actual = osftools.osfNotes(osfNotesData_json);
      equal(actual, osfNotesData_osf);
    }
  );

  test("parseNotes",
    function ()
    {
      var actual = osftools.parseNotes(osfNotesData_osf);
      deepEqual(actual, osfNotesData_json);
    }
  );
})();

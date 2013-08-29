(function ()
{
  module("osftools",
    {
    }
  );

  var HumanTime_data =
  {
    "00:00": 0,
    "01:01": 61,
    "00:22": 22,
    "02:01": 121,
    "00:00:00": 0,
    "01:01:01": 3661,
    "01:01:22": 3682,
    "02:01:01": 7261
  };

  for (var input in HumanTime_data)
  {
    fromHumanTime_createTest(input, HumanTime_data[input]);
  }

  function fromHumanTime_createTest(input, expected)
  {
    test("fromHumanTime - " + input,
      function ()
      {
        var actual = osftools.fromHumanTime(input);
        strictEqual(actual, expected);
      }
    );
  }

  for (var output in HumanTime_data)
  {
    var input = HumanTime_data[output];
    if(output.length == 5)
      output = "00:" + output;
    toHumanTime_createTest(input, output);
  }

  function toHumanTime_createTest(input, expected)
  {
    test("toHumanTime - " + input,
      function ()
      {
        var actual = osftools.toHumanTime(input);
        strictEqual(actual, expected);
      }
    );
  }

  var parseNote_data =
  {
    "foo": false,
    "0 foo": { time: 0, text: "foo", tags: [] },
    "0 foo #a": { time: 0, text: "foo", tags: [ "a" ] },
    "0 foo #a #b": { time: 0, text: "foo", tags: [ "a", "b" ] },
    "42 foo #a #b": { time: 42, text: "foo", tags: [ "a", "b" ] },
    "01:12:00 foo #a #b": { time: 4320, text: "foo", tags: [ "a", "b" ] }
  };

  for (var input in parseNote_data)
  {
    parseNote_createTest(input, parseNote_data[input]);
  }

  function parseNote_createTest(input, expected)
  {
    test("parseNote - '" + input + "'",
      function ()
      {
        var actual = osftools.parseNote(input);
        deepEqual(actual, expected);
      }
    );
  }

})();

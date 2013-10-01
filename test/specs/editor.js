(function ()
{
  var editor;
  var editorInfo = { name: "inline" };

  var mockPlayer = {
    getCurrentTime: function () {
      return 42;
    }
  };

  module("editor",
    {
      setup: function()
      {
        var edi = shownoteseditor.editors[editorInfo.name];
        var playground = $('#playground')[0];
        editor = new edi({ element: playground, id: "_test" }, mockPlayer, function (){});
      },
      teardown: function()
      {
        editor = null;
        $('#playground').empty();
      }
    }
  );

  function getHtmlTime () {
    return $('#playground input.time').val();
  }

  function getHtmlText () {
    return $('#playground input.text').val();
  }

  function setHtmlTime (time) {
    $('#playground input.time').val(time);
  }

  function setHtmlText (text) {
    $('#playground input.text').val(text);
  }

  test("close",
    function ()
    {
      editor.close();
      var expected = 0;
      var actual = $('#playground').children().length;
      strictEqual(actual, expected);
    }
  );

  var contentData = [
    {
      title: "basic",
      time: "00:00:00",
      text: "",
      note: { "link": "", "tags": [], "text": "", "time": 0 }
    },
    {
      title: "Time and text",
      time: "00:00:01",
      text: "a",
      note: { "link": "", "tags": [], "text": "a", "time": 1 }
    },
    {
      title: "Tags",
      time: "00:00:00",
      text: "#a",
      note: { "link": "", "tags": [ "a" ], "text": "", "time": 0 }
    },
    {
      title: "OSF link 1",
      setContent: false,
      time: "00:00:00",
      text: "a <http://google.com/>",
      note: { "link": "http://google.com/", "tags": [], "text": "a", "time": 0 }
    },
    {
      title: "OSF link 2",
      getContent: false,
      time: "00:00:00",
      text: "a http://google.com/",
      note: { "link": "http://google.com/", "tags": [], "text": "a", "time": 0 }
    },
    {
      title: "Inline link",
      setContent: false,
      time: "00:00:00",
      text: "a http://google.com/ b",
      note: { "link": "http://google.com/", "tags": [], "text": "a b", "time": 0 }
    }
  ];

  QUnit.cases(contentData).test("getContent - ",
    function (params)
    {
      if(params.getContent === false)
        return ok(true);

      setHtmlTime(params.time);
      setHtmlText(params.text);
      var actual = editor.getContent();
      var expected = params.note;
      deepEqual(actual, expected);
    }
  );

  QUnit.cases(contentData).test("setContent - ",
    function (params)
    {
      if(params.setContent === false)
        return ok(true);

      editor.setContent(params.note);

      var actualTime = getHtmlTime();
      var actualText = getHtmlText();
      var expectedTime = params.time;
      var expectedText = params.text;

      strictEqual(actualTime, expectedTime, "time");
      strictEqual(actualText, expectedText, "text");
    }
  );
})();

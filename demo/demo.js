var options =
{
  connector:
  {
    name: "memory",
    options:
    {
    }
  },
  ui:
  {
    player:
    {
      name: "audiojs",
      options:
      {
        element: $("#player")[0],
        files:
          [
            { src: "./ls000-der-lautsprecher.mp3", type: "audio/mpeg" }
          ]
      }
    },
    list:
    {
      name: "standard",
      options:
      {
        element: $('#notes')[0]
      }
    },
    editor:
    {
      name: "inline",
      options:
      {
        element: $('#maineditor')[0]
      }
    }
  }
};

var editor = new shownoteseditor.editor(options,
  function (err)
  {
    console.log("done, err=%s", err);
  }
);

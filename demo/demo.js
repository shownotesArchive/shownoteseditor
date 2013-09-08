var options =
{
  connector:
  {
    name: "memory",
    options:
    {
      docname: "ls000",
      save: "localStorage"
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

var sne = new shownoteseditor.sne(options,
  function (err)
  {
    console.log("done, err=%s", err);
  }
);

$('#btnShowImportExport').click(
  function ()
  {
    var $exportImport = $('#exportImport');
    $exportImport.toggleClass('hidden');
    if($exportImport.hasClass('hidden'))
    {
      move("#exportImport").set("right", -550).end();
    }
    else
    {
      move("#exportImport").set("right", 0).end();
    }
  }
);

var $txtOsf = $('#txtOsf');

$('#btnExport').click(
  function ()
  {
    var notes = sne.connector.getFriendlyJson();
    var osf = osftools.osfNotes(notes);
    $txtOsf.val(osf);
  }
);


$('#btnImport').click(
  function ()
  {
    var osf = $txtOsf.val();
    var notes = osftools.parseNotes(osf);
    sne.loadNotes(notes);
  }
);

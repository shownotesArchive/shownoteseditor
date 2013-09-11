var $docs = $('#docs');
var connector = "memory";

shownoteseditor.connectors[connector].listDocuments({ save: "localStorage" },
  function (err, docs)
  {
    tabletools.clear($docs);

    for (var i = 0; i < docs.length; i++)
    {
      var doc = docs[i];
      addDoc(doc);
    }

    function addDoc (doc)
    {
      var $btns = $('#btnsTemplate').clone();
      var accessDate = moment(doc.accessDate).format("DD.MM.YYYY");
      var $td = tabletools.addRow($docs, [ doc.name, accessDate, doc.notesCount, $btns ]);

      $btns = $td.find('.btns').parent().addClass('btns');
      $td.find('button.open').click(
        function ()
        {
          openDoc(doc.name);
        }
      );
    }
  }
);

$('#btnCreateDoc').click(
  function ()
  {
    var name = $('#txtCreateDoc').val();
    openDoc(name);
  }
);

function openDoc (name)
{
  var options =
  {
    connector:
    {
      name: connector,
      options:
      {
        docname: name,
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

      move("#docChooserWrapper").set('opacity', 0).duration("0.5s").end();
      setTimeout(function (){ $('#docChooserWrapper').removeClass('active'); }, 500);
    }
  );
}

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

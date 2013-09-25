var $docs = $('#docs');
var connector = "memory";
var connectorOptionsSave = "localStorage";

function showDocChooser()
{
  $('#docChooserWrapper').addClass('active');
  $('#docChooserWrapper').attr('style', '');

  shownoteseditor.connectors[connector].listDocuments({ save: connectorOptionsSave },
    function (err, docs)
    {
      tabletools.clear($docs);

      $('#noDocs').css('display', (docs.length == 0) ? 'block' : 'none');

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
        $td.find('button.download').click(
          function ()
          {
            downloadDoc(doc.name);
          }
        );
      }
    }
  );
}

showDocChooser();

$('#docsSearch').keyup(
  function ()
  {
    $.uiTableFilter($docs, $('#docsSearch').val(), "Name");
  }
);

var createDocTxtIds = [ "txtCreateDoc" ];

$('#' + createDocTxtIds.join(',#')).keypress(
  function (e)
  {
    if(e.which == 13)
      createDoc();
  }
)

$('#btnCreateDoc').click(createDoc);

function createDoc ()
{
  var name = $('#txtCreateDoc').val();
  openDoc(name);
}

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
        save: connectorOptionsSave
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

  $('#notes, #maineditor, #player').empty();
  $('#txtOsf').val('');

  sne = new shownoteseditor.sne(options,
    function (err)
    {
      console.log("done, err=%s", err);

      move("#docChooserWrapper").set('opacity', 0).duration("0.5s").end();
      setTimeout(function (){ $('#docChooserWrapper').removeClass('active'); }, 500);
    }
  );
}

function downloadDoc (name)
{
  shownoteseditor.connectors[connector].getDocument({ save: connectorOptionsSave }, name,
    function (err, notes)
    {
      var osf = osftools.osfNotes(notes);

      var parts = [osf];
      var blob = new Blob(parts, { "type" : "text/octet-stream" });
      var url = window.URL.createObjectURL(blob);

      var a = document.createElement('a');
      a.href = url;
      a.download = name + ".osf.txt";
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      delete a;
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

$('#btnShowDocChooser').click(
  function ()
  {
    showDocChooser();
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

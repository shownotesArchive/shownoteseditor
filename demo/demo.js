var $docs = $('#docs');
var connector = "memory";
var connectorOptionsSave = "localStorage";
var previewPlayerTimeout = -1;
var docs = [];

function showDocChooser()
{
  $('#docChooserWrapper').addClass('active');
  $('#docChooserWrapper').attr('style', '');
  reloadDocsTable();
}

function reloadDocsTable ()
{
  shownoteseditor.connectors[connector].listDocuments({ save: connectorOptionsSave },
    function (err, _docs)
    {
      docs = _docs;;
      tabletools.clear($docs);

      $('#noDocs').css('display', (docs.length == 0) ? 'block' : 'none');

      for (var i = 0; i < docs.length; i++)
      {
        var doc = docs[i];
        addDocToTable(doc);
      }
    }
  );
}

function addDocToTable (doc)
{
  var $btns = $('#btnsTemplate').clone();
  var accessDate = moment(doc.accessDate).format("DD.MM.YYYY");
  var $td = tabletools.addRow($docs, [ doc.name, accessDate, doc.notesCount, $btns ]);

  $btns = $td.find('.btns').parent().addClass('btns');
  $td.click(
    function (e)
    {
      if(e.target.tagName.toLowerCase() == "button")
        return;
      openDoc(doc.name);
    }
  );
  $td.find('button.download').click(
    function ()
    {
      downloadDoc(doc.name);
    }
  );
  $td.find('button.rename').click(
    function ()
    {
      downloadDoc(doc.name);
    }
  );
  $td.find('button.delete').click(
    function ()
    {
      deleteDoc(doc.name);
      reloadDocsTable();
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

$('#txtCreateDocName').keypress(
  function (e)
  {
    if(e.which == 13)
      createDoc();
  }
);

$('#txtCreateDocFile').keypress(
  function (e)
  {
    if(e.which == 13)
      createDoc();
    else
    {
      clearTimeout(previewPlayerTimeout);
      previewPlayerTimeout = setTimeout(showPreviewPlayer, 1000);
    }
  }
);

function showPreviewPlayer()
{
  var url = $('#txtCreateDocFile').val();
  $('#createPlayerWrapper').empty();

  var options = {
    element: $("#createPlayerWrapper")[0],
    files: getFilesArrayFromUrls([url]).files
  };

  if(options.files.length > 0)
  {
    var player = new shownoteseditor.players.audiojs(options, function () {});
  }
}

$('#btnCreateDoc').click(createDoc);

function createDoc ()
{
  var name = $('#txtCreateDocName').val();
  var url = $('#txtCreateDocFile').val();

  shownoteseditor.connectors[connector].createDocument(
    { save: connectorOptionsSave },
    {
      name: name,
      urls: [url]
    },
    function (err, doc)
    {
      if(err)
      {
        alert("Error: " + err);
      }
      else
      {
        addDocToTable(doc);
        docs.push(doc);
      }
    }
  );
}

function getFilesArrayFromUrls (urls)
{
  var files = [];
  var errors = [];

  if(!urls || !urls.length)
    return { files: [], errors: [] };

  for (var i = 0; i < urls.length; i++)
  {
    var url = urls[i];

    if(url.indexOf(".mp3") == url.length - 4)
      files.push({ src: url, type: "audio/mpeg" });
    else
      errors.push(url);
  }

  return { files: files, errors: errors };
}

function openDoc (name)
{
  var doc;

  for (var i = 0; i < docs.length; i++)
  {
    if(docs[i].name == name)
      doc = docs[i];
  }

  var files = getFilesArrayFromUrls(doc.urls);
  var errors = files.errors;
  files = files.files;

  if(errors.length > 0)
    alert("Could not find type of:\n" + errors.join("\n"));
  
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
          files: files
        }
      },
      list:
      {
        name: "standard",
        options:
        {
          element: $('#notes')[0],
          shouldScroll: true
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

function deleteDoc (name)
{
  shownoteseditor.connectors[connector].deleteDocument({ save: connectorOptionsSave }, name,
    function (err)
    {
      reloadDocsTable();
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

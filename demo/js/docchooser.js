if(typeof sne == "undefined") sne = { steps: {} };
sne.steps.docchooser = {};

(function ()
{
  var previewPlayerTimeout = -1;
  var docchooserCallback = null;
  var docs = [];
  var $docs = $('#docs');

  sne.steps.docchooser.show = function (cb)
  {
    logNavigation('docchoser');
    $('#docChooser').addClass('active');
    reloadDocsTable();
    docchooserCallback = cb;
  };

  sne.steps.docchooser.hide = function ()
  {
    $('#docChooser').removeClass('active');
    docchooserCallback();
  };

  function reloadDocsTable ()
  {
    shownoteseditor.connectors[sne.connectorName].listDocuments(sne.connectorOptions,
      function (err, _docs)
      {
        docs = _docs;
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
        var $target = $(e.target);

        if($target.prop('tagName').toLowerCase() == "button" ||
           $target.parent().prop('tagName').toLowerCase() == "button")
        {
          return;
        }

        openDoc(doc.id);
      }
    );
    $td.find('button.download').click(
      function ()
      {
        downloadDoc(doc.id, doc.name);
      }
    );
    $td.find('button.rename').click(
      function ()
      {
        downloadDoc(doc.id);
      }
    );
    $td.find('button.delete').click(
      function ()
      {
        deleteDoc(doc.id,
          function (err)
          {
            reloadDocsTable();
            if(err)
              alert(err);
          }
        );
      }
    );
  }
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

  $('#txtCreateDocFile').keydown(
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

    shownoteseditor.connectors[sne.connectorName].createDocument(
      sne.connectorOptions,
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
          docs.push(doc);
          openDoc(doc.id);

          $('#createDoc').children('input').val("");
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

      if(url.toLowerCase().indexOf(".mp3") == url.length - 4)
        files.push({ src: url, type: "audio/mpeg" });
      else
        errors.push(url);
    }

    return { files: files, errors: errors };
  }

  function openDoc (id)
  {
    var doc;

    for (var i = 0; i < docs.length; i++)
    {
      if(docs[i].id == id)
        doc = docs[i];
    }

    var files = getFilesArrayFromUrls(doc.urls);
    var errors = files.errors;
    files = files.files;

    if(errors.length > 0)
      alert("Could not find type of:\n" + errors.join("\n"));

    sne.doc = doc;
    sne.files = files;
    logNavigation('doc/' + doc.name);

    sne.steps.docchooser.hide();
  }

  function downloadDoc (id, name)
  {
    shownoteseditor.connectors[sne.connectorName].getDocument(sne.connectorOptions, id,
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

  function deleteDoc (id, cb)
  {
    var res = confirm("Do you really want to delete this document?");

    if(!res)
      return;

    shownoteseditor.connectors[sne.connectorName].deleteDocument(sne.connectorOptions, id, cb);
  }
})();

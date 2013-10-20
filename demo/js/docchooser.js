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
    var owner = doc.owner;
    if(owner === false)
      owner = "you";
    else
      owner = owner;
    var $td = tabletools.addRow($docs, [ doc.name, accessDate, owner, $btns ]);

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
    $td.find('button.edit').click(
      function ()
      {
        sne.steps.docedit.show("edit", doc,
          function (success, doc)
          {
            $('#docChooser').addClass('active');
            reloadDocsTable();
          }
        );
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

  $('#createDoc').click(showCreateDoc);

  function showCreateDoc ()
  {
    sne.steps.docedit.show("create", null,
      function (success, doc)
      {
        if(success)
        {
          docs.push(doc);
          openDoc(doc.id);
        }
        else
        {
          $('#docChooser').addClass('active');
        }
      }
    );
  }

  function openDoc (id)
  {
    var doc;

    for (var i = 0; i < docs.length; i++)
    {
      if(docs[i].id == id)
        doc = docs[i];
    }

    sne.doc = doc;
    sne.files = doc.urls;
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

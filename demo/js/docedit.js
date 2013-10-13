if(typeof sne == "undefined") sne = { steps: {} };
sne.steps.docedit = {};

(function ()
{
  var previewPlayerTimeout = -1;
  var doceditCallback = null;
  var mode;
  var doc;

  sne.steps.docedit.show = function (_mode, _doc, cb)
  {
    logNavigation('docEdit');
    $('#docChooser').removeClass('active');
    $('#docEdit').addClass('active');
    doceditCallback = cb;

    mode = _mode;
    doc = _doc;

    fillEditor();
  };

  sne.steps.docedit.hide = function (success, doc)
  {
    $('#docEdit').removeClass('active');
    doceditCallback(success, doc);
  };

  function fillEditor ()
  {
    var heading = mode == "edit" ? "Edit document: " + doc.docname : "Create document";
    $('#docEdit').children("h2").text(heading);

    var docname = "";
    var url = "";

    if(mode == "edit")
    {
      docname = doc.name;
      url = doc.urls[0];
    }

    $('#docEdit_name').val(docname);
    $('#docEdit_url').val(url);
  }

  function saveEditor (cb)
  {
    var name = $('#docEdit_name').val();
    var url = $('#docEdit_url').val();

    if(mode == "create")
    {
      shownoteseditor.connectors[sne.connectorName].createDocument(
        sne.connectorOptions,
        {
          name: name,
          urls: [url]
        },
        cb
      );
    }
    else if(mode == "edit")
    {
      shownoteseditor.connectors[sne.connectorName].changeDocument(
        sne.connectorOptions,
        doc.id,
        {
          name: name,
          urls: [url]
        },
        cb
      );
    }
  }

  $('#docEdit_url').keydown(
    function (e)
    {
      clearTimeout(previewPlayerTimeout);
      previewPlayerTimeout = setTimeout(showPreviewPlayer, 1000);
    }
  );

  function showPreviewPlayer()
  {
    var url = $('#docEdit_url').val();
    $('#docEdit_player').empty();

    var options = {
      element: $("#docEdit_player")[0],
      files: [url]
    };

    if(options.files.length > 0)
    {
      var player = new shownoteseditor.players.audiojs(options, function () {});
    }
  }

  $('#docEdit_save').click(saveClicked);
  $('#docEdit_cancel').click(cancelClicked);

  function saveClicked ()
  {
    saveEditor(
      function (err, doc)
      {
        if(err)
          return alert(err);

        sne.steps.docedit.hide(!err, doc);
      }
    );
  }

  function cancelClicked ()
  {
    sne.steps.docedit.hide(false);
  }

})();
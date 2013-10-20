if(typeof sne == "undefined") sne = { steps: {} };
sne.steps.docedit = {};

(function ()
{
  var $collabs = $('#docEdit_collabs > ul:first');
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
    var heading = mode == "edit" ? "Edit document: " + doc.name : "Create document";
    $('#docEdit').children("h2").text(heading);

    var docname = "";
    var url = "";
    var users = {};

    if(mode == "edit")
    {
      docname = doc.name;
      url = doc.urls[0];
      users = doc.access.users || {};
    }

    $('#docEdit_name').val(docname);
    $('#docEdit_url').val(url);

    $collabs.empty();
    for (var u in users)
    {
      var $li = createUserLi(u);
      $collabs.append($li);
    }
  }

  function createUserLi (u)
  {
    var $li = $('<li><span class="name"></span> <div class="controls"><i class="icon-trash delete"></i></div></li>')

    $li.find('.name').text(u);
    $li.prop('data-id', u);
    $li.find('.delete').click(
      function ()
      {
        $li.remove();
      }
    );

    return $li;
  }

  function saveEditor (cb)
  {
    var newDoc = {
      name: $('#docEdit_name').val(),
      urls: [$('#docEdit_url').val()],
      access: {
        public: false,
        users: {}
      }
    };

    var $users = $collabs.children('li');

    for (var i = 0; i < $users.length; i++) {
      var $user = $($users[i]);
      var id = $user.prop('data-id')
      newDoc.access.users[id] = { "canWrite": true };
    }

    if(mode == "create")
    {
      shownoteseditor.connectors[sne.connectorName].createDocument(
        sne.connectorOptions,
        newDoc,
        cb
      );
    }
    else if(mode == "edit")
    {
      shownoteseditor.connectors[sne.connectorName].changeDocument(
        sne.connectorOptions,
        doc.id,
        newDoc,
        cb
      );
    }
  }

  $('#docEdit_collabs_add').click(
    function ()
    {
      var u = $('#docEdit_collabs_name').val();$
      var $li = createUserLi(u);
      $collabs.append($li);
    }
  );

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
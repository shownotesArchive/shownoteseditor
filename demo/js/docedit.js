if(typeof sne == "undefined") sne = { steps: {} };
sne.steps.docedit = {};

(function ()
{
  var $collabs = $('#docEdit_collabs > ul:first');
  var previewPlayerTimeout = -1;
  var doceditCallback = null;
  var usernameMap;
  var mode;
  var doc;

  sne.steps.docedit.show = function (_mode, _doc, _usernameMap, cb)
  {
    logNavigation('docEdit');
    $('#docChooser').removeClass('active');
    $('#docEdit').addClass('active');
    doceditCallback = cb;

    mode = _mode;
    doc = _doc;
    usernameMap = _usernameMap;

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
    var name = "Unnamed (" + u + ")";

    if(usernameMap[u])
      name = usernameMap[u].name;

    $li.find('.name').text(name);
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

  var $collabs_search = $('#docEdit_collabs_search');
  var $collabs_search_in = $collabs_search.find('input');
  var $collabs_search_ul = $collabs_search.find('ul');

  $('#docEdit_collabs_add').click(
    function ()
    {
      if($collabs_search_ul.children().length != 1)
        return alert("User was not found");

      var uid = $collabs_search_ul.children(":first").prop('data-id');
      var $li = createUserLi(uid);
      $collabs.append($li);
      clearCollabInput();
    }
  );

  function clearCollabInput ()
  {
    $collabs_search_in.val('');
    updateSearch();
  }

  $collabs_search_in.on('keydown',
    function (e)
    {
      if(e.which == 13)
        $('#docEdit_collabs_add').click()
    }
  );

  $collabs_search_in.on('input', updateSearch);

  function updateSearch ()
  {
    var val = $collabs_search_in.val().toLowerCase();
    var i = 0;
    $collabs_search_ul.empty();

    if(val)
    {
      for (var uid in usernameMap)
      {
        if(usernameMap[uid].name && usernameMap[uid].name.toLowerCase().indexOf(val) !== -1)
        {
          createSearchResult(uid, usernameMap[uid]);
          i++;

          if(i == 10)
            break;
        }
      }

      function createSearchResult (uid, u)
      {
        var $li = $("<li>");
        $li.text(u.name);
        $li.prop('data-id', uid);
        $li.click(function ()
          {
            $collabs.append(createUserLi(uid));
            clearCollabInput();
          }
        );
        $collabs_search_ul.append($li);
      }
    }

    if($collabs_search_ul.children().length == 0)
      $collabs_search_ul.hide();
    else
      $collabs_search_ul.show();
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
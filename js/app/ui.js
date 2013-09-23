(function ()
{
  var self = {};

  shownoteseditor.ui = function (options, connector, cb)
  {
    console.log("UI init", options);

    this.connector = connector;
    var that = this;

    async.series(
      [
        function (cb)
        {
          var playerOps = options.player;
          var player = shownoteseditor.players[playerOps.name];

          if(!player)
            return cb("Invalid playername");

          that.player = new player(playerOps.options, function (){});
          cb();
        },
        function (cb)
        {
          var listOps = options.list;
          var list = shownoteseditor.lists[listOps.name];

          if(!list)
            return cb("Invalid listname");

          that.list = new list(listOps.options, function (){});
          that.list.bind("editRequested", listEditRequested.bind(that));
          that.list.bind("removeRequested", listRemoveRequested.bind(that));
          that.list.bind("addRequested", listAddRequested.bind(that));
          that.list.bind('jumpRequested', listJumpRequested.bind(that))

          connector.bind("noteAdded", that.list.addNote.bind(that.list));
          connector.bind("noteRemoved", that.list.removeNote.bind(that.list));
          connector.bind("noteEdited", that.list.editNote.bind(that.list));

          cb();
        },
        function (cb)
        {
          var editorOps = options.editor;
          var editor = shownoteseditor.editors[editorOps.name];

          if(!editor)
            return cb("Invalid editorname");

          editorOps.options.id = "_root";

          that.editor = editor;
          that.maineditor = new editor(editorOps.options, that.player, function (){});
          that.maineditor.bind("submitted", addEditorSubmitted.bind(that));
          cb();
        }
      ],
      cb
    );
  };

  function listEditRequested(id, element, editEnded)
  {
    var that = this;

    this.connector.getNote(id,
      function (err, note)
      {
        if(err)
        {
          editEnded();
          return alert(err);
        }

        var options = {
          element: element,
          id: id,
          content: osftools.cloneNote(note, false)
        };

        var editor = new that.editor(options, this.player, function (){});
        editor.bind('submitted',
          function (id, content)
          {
            editEnded();
            editEditorSubmitted.call(that, id, content);
          }
        );
      }
    );
  }

  function listRemoveRequested(id)
  {
    this.connector.removeNote(id,
      function (err)
      {
        if(err)
        {
          alert(err);
        }
      }
    );
  }

  function listAddRequested(parentId, element, addEnded)
  {
    var that = this;
    var options = {
      element: element,
      id: parentId + "_subnote"
    };

    var editor = new this.editor(options, this.player, function (){});
    editor.bind('submitted',
      function (id, content)
      {
        addEnded(true);
        addEditorSubmitted.call(that, parentId, content);
      }
    );
  }

  function listJumpRequested(id)
  {
    var that = this;

    this.connector.getNote(id,
      function (err, note)
      {
        var time = note.time;
        that.player.setCurrentTime(time);
      }
    );
  }

  function editEditorSubmitted(id, content)
  {
    this.connector.editNote(id, content,
      function (err)
      {
        if(err)
        {
          alert(err);
        }
      }
    );
  }

  function addEditorSubmitted(id, content)
  {
    this.connector.addNote(content, id,
      function (err)
      {
        if(err)
        {
          alert(err);
        }
      }
    );
  }

  shownoteseditor.ui.prototype = self;
})();

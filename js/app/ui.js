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
          that.list.bind("editRequested", listAddRequested.bind(that));

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

          editorOps.options.id = "main";

          that.maineditor = new editor(editorOps.options, that.player, function (){});
          that.maineditor.bind("submitted", maineditorSubmitted.bind(that));
          cb();
        }
      ],
      cb
    );
  };

  function listEditRequested(id, element, editEnded)
  {
  }

  function listAddRequested(parentId, element, addEnded)
  {
  }

  function maineditorSubmitted(id, content)
  {
    var note = {};
    note.text = content.text;

    this.connector.addNote(content,
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

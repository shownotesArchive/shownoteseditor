(function ()
{
  var self = {};

  shownoteseditor.ui = function (options, cb)
  {
    console.log("UI init", options);

    async.series(
      [
        function (cb)
        {
          var playerOps = options.player;
          var player = shownoteseditor.players[playerOps.name];

          if(!player)
            return cb("Invalid playername");

          this.player = new player(playerOps.options, cb);
        },
        function (cb)
        {
          var listOps = options.list;
          var list = shownoteseditor.lists[listOps.name];

          if(!list)
            return cb("Invalid listname");

          this.list = new list(listOps.options, cb);
        }
      ],
      cb
    );
  };

  shownoteseditor.ui.prototype = self;
})();

(function ()
{
  var self = {};

  self.init = function (options, cb)
  {
    console.log("UI init", options);

    self.player = shownoteseditor.players[options.player.name];

    if(!self.player)
      return cb("Invalid playername");

    self.player.init(options.player.options, cb);
  };

  shownoteseditor.ui = self;
})();

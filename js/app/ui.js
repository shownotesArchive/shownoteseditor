(function ()
{
  var self = {};

  self.init = function (options, cb)
  {
    self.player = shownoteseditor.players[options.player];

    if(!self.player)
      return cb("Invalid playername");

    self.player.init({}, cb);
  };

  shownoteseditor.ui = self;
})();

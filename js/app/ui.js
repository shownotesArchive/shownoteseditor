(function ()
{
  var self = {};

  function ctor(options, cb)
  {
    console.log("UI init", options);

    var player = shownoteseditor.players[options.player.name];

    if(!player)
      return cb("Invalid playername");

    this.player = new player(options.player.options, cb);
  };

  shownoteseditor.ui = ctor;
  shownoteseditor.ui.prototype = self;
})();

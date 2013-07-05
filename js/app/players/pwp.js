(function ()
{
  var self = {};

  self.init = function (options, cb)
  {
    console.log("pwp init", options);
    cb();
  };

  shownoteseditor.players.pwp = self;
})();

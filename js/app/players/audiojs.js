(function ()
{
  var self = {};

  shownoteseditor.players.pwp = function (options, cb)
  {
    console.log("audiojs init", options);
    cb();
  };

  shownoteseditor.players.pwp.prototype = self;
})();

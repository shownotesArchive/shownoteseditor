(function ()
{
  var self = {};

  function ctor(options, cb)
  {
    console.log("pwp init", options);
    cb();
  };

  shownoteseditor.players.pwp = ctor;
  shownoteseditor.players.pwp.prototype = self;
})();

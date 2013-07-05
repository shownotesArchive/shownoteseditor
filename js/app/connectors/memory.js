(function ()
{
  var self = {};

  self.init = function (options, cb)
  {
    console.log("memory init", options);
    cb();
  };

  shownoteseditor.connectors.memory = self;
})();

if(typeof sne == "undefined") sne = {};
sne.connectorName = "firebase";
sne.connectorOptions = { };

(function ()
{
  var steps = [ "login", "docchooser", "sne" ];

  async.eachSeries(
    steps,
    function (step, cb)
    {
      sne.steps[step].show(cb);
    }
  );
})();

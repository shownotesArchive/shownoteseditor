if(typeof sne == "undefined") sne = {};
sne.connectorName = "firebase";
sne.connectorOptions = { };

(function ()
{
  var steps = [ "login", "docchooser"];

  async.eachSeries(
    steps,
    function (step, cb)
    {
      sne.steps[step].show(cb);
    },
    function ()
    {
      sne.steps.sne.show();
      $('#initwrapper').css('display', 'none');
    }
  );
})();

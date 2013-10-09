(function ()
{
  var self = {};

  shownoteseditor.players.mediaelement = function (options, cb)
  {
    console.log("mediaelement init", options);

    if(typeof MediaElementPlayer == "undefined")
      console.error("Please add mediaelement.js to your HTML-Header.");

    this.player = new MediaElementPlayer(options.element, {});
    this.player.setSrc(options.files[0].src);
    cb();
  };

  self.play = function ()
  {
    this.player.play();
  };

  self.pause = function ()
  {
    this.player.pause();
  };

  self.setCurrentTime = function (time)
  {
    this.player.setCurrentTime(time);
  };

  self.getCurrentTime = function ()
  {
    return this.player.currentTime;
  };

  self.jumpTime = function (time)
  {
    this.setCurrentTime(this.getCurrentTime() + time);
  };

  shownoteseditor.players.mediaelement.prototype = self;
  MicroEvent.mixin(shownoteseditor.players.mediaelement);
})();

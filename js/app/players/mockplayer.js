(function ()
{
  var self = {};

  shownoteseditor.players.mockplayer = function (options, cb)
  {
    console.log("mockplayer init", options);
    cb();
  };

  self.play = function ()
  {
    this.paused = false;
  };

  self.pause = function ()
  {
    this.paused = true;
  };

  self.setCurrentTime = function (time)
  {
    this.currentTime = time;
  };

  self.getCurrentTime = function ()
  {
    return this.currentTime;
  };

  self.jumpTime = function (time)
  {
    this.setCurrentTime(this.getCurrentTime() + time);
  };

  shownoteseditor.players.mockplayer.prototype = self;
  MicroEvent.mixin(shownoteseditor.players.mockplayer);
})();

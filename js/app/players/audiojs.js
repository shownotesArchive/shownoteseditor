(function ()
{
  var self = {};

  shownoteseditor.players.pwp = function (options, cb)
  {
    console.log("audiojs init", options);

    audiojs.events.ready(
      function()
      {
        var audiojsOptions = {};

        this.audio = audiojs.create(options.element, audiojsOptions);
        cb();
      }
    );
  };

  self.play = function ()
  {
    this.audio.play();
  };

  self.pause = function ()
  {
    this.audio.pause();
  };

  self.setCurrentTime = function (time)
  {
    this.audio.currentTime = time;
  };

  self.getCurrentTime = function ()
  {
    return this.audio.currentTime;
  };

  self.jumpTime = function (time)
  {
    this.setCurrentTime(getCurrentTime() + time);
  }

  shownoteseditor.players.pwp.prototype = self;
})();

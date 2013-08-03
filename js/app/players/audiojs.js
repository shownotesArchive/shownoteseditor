(function ()
{
  var self = {};

  shownoteseditor.players.audiojs = function (options, cb)
  {
    console.log("audiojs init", options);

    if(typeof audiojs == "undefined")
      Console.error("Please add audio.js to your HTML-Header.");

    var that = this;

    audiojs.events.ready(
      function()
      {
        var audiojsOptions = {};
        that.audio = audiojs.create(options.element, audiojsOptions);
        that.audio.loadStarted = function ()
        {
          cb();
        };
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
    this.audio.element.currentTime = time;
    this.audio.updatePlayhead();
  };

  self.getCurrentTime = function ()
  {
    return this.audio.element.currentTime;
  };

  self.jumpTime = function (time)
  {
    this.setCurrentTime(this.getCurrentTime() + time);
  }

  shownoteseditor.players.audiojs.prototype = self;
})();

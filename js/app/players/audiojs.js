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
        var $audio = $('<audio>');
        $audio.prop("preload", "none");

        for (var i = 0; i < options.files.length; i++)
        {
          var file = options.files[i];

          var $source = $('<source>');
          $source.prop('src', file.src);
          $source.prop('type', file.type);
          $audio.append($source);
        }

        $(options.element).append($audio);

        var audiojsOptions = {
          useFlash: true
        };
        that.audio = audiojs.create($(options.element).find('audio')[0], audiojsOptions);
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
    var dur = this.audio.duration;
    var percent = time / dur;
    this.audio.skipTo(percent);
  };

  self.getCurrentTime = function ()
  {
    return Math.floor(this.audio.currentTime);
  };

  self.jumpTime = function (time)
  {
    this.setCurrentTime(this.getCurrentTime() + time);
  };

  shownoteseditor.players.audiojs.prototype = self;
  MicroEvent.mixin(shownoteseditor.players.audiojs);
})();

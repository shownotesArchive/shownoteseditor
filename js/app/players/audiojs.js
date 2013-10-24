(function ()
{
  var self = {};

  shownoteseditor.players.audiojs = function (options, connector, cb)
  {
    console.log("audiojs init", options);

    if(typeof audiojs == "undefined")
      console.error("Please add audio.js to your HTML-Header.");

    var that = this;

    audiojs.events.ready(
      function()
      {
        var $audio = $('<audio>');
        $audio.prop("preload", "none");

        var files = getFilesArrayFromUrls(options.files);
        var errors = files.errors;
        files = files.files;

        //if(errors.length > 0)
        //  alert("Could not find type of:\n" + errors.join("\n"));

        for (var i = 0; i < files.length; i++)
        {
          var file = files[i];

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

  function getFilesArrayFromUrls (urls)
  {
    var files = [];
    var errors = [];

    if(!urls || !urls.length)
      return { files: [], errors: [] };

    for (var i = 0; i < urls.length; i++)
    {
      var url = urls[i];

      if(url.toLowerCase().indexOf(".mp3") == url.length - 4)
        files.push({ src: url, type: "audio/mpeg" });
      else
        errors.push(url);
    }

    return { files: files, errors: errors };
  }

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

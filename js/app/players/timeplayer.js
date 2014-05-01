(function ()
{
  var self = {};

  /* jshint laxbreak:true */
  var html = "<div class='timeplayer'>"
           +   "<span class='time'></span>"
           +   "<button class='stop' style='display: none'><i class='fa fa-pause'></i> Pause</button>"
    +   "<button class='start'><i class='fa fa-play'></i> Start</button>"
    +   "<button class='set'>Set</button>"
    +   "<button class='reset'>Reset</button>"
           + "</div>";
  /* jshint laxbreak:false */

  shownoteseditor.players.timeplayer = function (options, connector, cb)
  {
    console.log("timeplayer init", options);

    this.connector = connector;
    this.timeOffset = 0;

    this.connector.getServerTimeOffset(
      function (err, off)
      {
        this.timeOffset = off;
      }.bind(this)
    );

    var $elem = $(options.element);
    this.player = {};
    this.player.main = $(html);
    $elem.append(this.player.main);

    this.player.time = this.player.main.find('.time');

    this.player.start = this.player.main.find('.start');
    this.player.start.click(function () { this.play(); }.bind(this));

    this.player.stop = this.player.main.find('.stop');
    this.player.stop.click(function () { this.pause(); }.bind(this));

    this.player.set = this.player.main.find('.set');
    this.player.set.click(
      function ()
      {
        var oldTime = osftools.toHumanTime(this.getCurrentTime());
        var newTime = prompt("", oldTime);
        newTime = osftools.fromHumanTime(newTime);
        this.setCurrentTime(newTime);
      }.bind(this)
    );

    this.player.reset = this.player.main.find('.reset');
    this.player.reset.click(function () { this.setCurrentTime(0); }.bind(this));

    this.setCurrentTime(0);

    this.paused = true;

    this.firstSync = true;
    this.connector.bindCustom("timeplayer/status", function (key, val) { this.onRemoteUpdate(val); }.bind(this));

    setInterval(updateTime.bind(this), 1000);

    cb();
  };

  self.onRemoteUpdate = function (val)
  {
    if(!val)
      return;

    if(val.status == "play")
    {
      var currentTime = this.getCurrentTime();

      if(this.firstSync)
        currentTime = val.playtime;

      var time = currentTime + ((+new Date() + this.timeOffset) - val.realtime) / 1000;
      time = Math.floor(time);


      this.play(true);
      this.setCurrentTime(time);
    }
    else
    {
      this.pause(true);
      this.setCurrentTime(val.playtime);
    }

    this.firstSync = false;
  };

  self.setRemoteStatus = function (status)
  {
    var now = +new Date() + this.timeOffset;
    this.connector.setCustom("timeplayer/status", { realtime: Math.floor(now), playtime: this.currentTime,  status: status });
  };

  self.play = function (disableRemote)
  {
    this.paused = false;

    if(!disableRemote)
      this.setRemoteStatus("play");

    this.player.start.hide();
    this.player.stop.show();
  };

  self.pause = function (disableRemote)
  {
    this.paused = true;

    if(!disableRemote)
      this.setRemoteStatus("pause");

    this.player.start.show();
    this.player.stop.hide();
  };

  self.setCurrentTime = function (time)
  {
    var str = osftools.toHumanTime(time);
    this.player.time.text(str);
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

  function updateTime ()
  {
    if(!this.paused)
      this.jumpTime(1);
  }

  shownoteseditor.players.timeplayer.prototype = self;
  MicroEvent.mixin(shownoteseditor.players.timeplayer);
})();

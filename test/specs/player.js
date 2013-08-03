(function ()
{
  var player;
  var html5player;
  var playerInfo = { name: "audiojs" };

  var audioHtml =
    '<audio id="player">' +
      '<source src="http://meta.metaebene.me/media/lautsprecher/ls000-der-lautsprecher.m4a" type="audio/mp4"/>' +
      '<source src="http://meta.metaebene.me/media/lautsprecher/ls000-der-lautsprecher.oga" type="audio/ogg"/>' +
      '<source src="http://meta.metaebene.me/media/lautsprecher/ls000-der-lautsprecher.mp3" type="audio/mpeg"/>' +
    '</audio>';

  module("player",
    {
      setup: function()
      {
        stop();

        $('#playground').append(audioHtml);

        var play = shownoteseditor.players[playerInfo.name];
        player = new play({ element: $("#player")[0] }, start);
        html5player = $('#playground audio')[0];
      },
      teardown: function()
      {
        player = null;
        $('#playground').empty();
      }
    }
  );

  test("SetCurrentTime()",
    function ()
    {
      var expected = 42;

      html5player.play();
      player.setCurrentTime(expected);
      var actual = html5player.currentTime;

      equal(actual, expected);
    }
  );

  test("GetCurrentTime()",
    function ()
    {
      var expected = 43;

      html5player.currentTime = expected;
      var actual = player.getCurrentTime();

      equal(actual, expected);
    }
  );

  test("Get/Set-CurrentTime()",
    function ()
    {
      var expected = 44;

      player.setCurrentTime(expected);
      var actual = player.getCurrentTime();

      equal(actual, expected, "time set");
    }
  );

  test("jumpTime()",
    function ()
    {
      var expected = 42;

      html5player.currentTime = expected - 2;
      player.jumpTime(2);
      var actual = html5player.currentTime;

      equal(actual, expected);
    }
  );

  test("pause()",
    function ()
    {
      html5player.play();
      player.pause();

      equal(html5player.paused, true);
    }
  );

  test("play()",
    function ()
    {
      html5player.pause();
      player.play();

      equal(html5player.paused, false);
    }
  );
})();

var osftools = {};

(function ()
{
  osftools.parseNote = function (note)
  {
    var result = { time: null, text: [], tags: [] };
    var parts = note.split(' ');

    for (var i = 0; i < parts.length; i++)
    {
      var part = parts[i];

      if(i == 0)
      {
        var time = Number(part); // timestamp

        if(isNaN(time))
          time = osftools.fromHumanTime(part); // HH:MM:SS
        if(isNaN(time) || time === false)
          return false;

        result.time = time;
        continue;
      }

      if(part.indexOf('#') == 0)
      {
        result.tags.push(part.substr(1));
        continue;
      }

      result.text.push(part);
    }

    result.text = result.text.join(' ');

    return result;
  };

  osftools.normalizeTags = function (tags)
  {
    var mapping = {
      "c": "chapter",
      "q": "quote"
    };

    var newTags = [];

    for (var i = 0; i < tags.length; i++)
    {
      var tag = tags[i];
      var newTag = mapping[tag] || tag;
      newTags.push(newTag);
    }

    return newTags;
  };

  osftools.toHumanTime = function (time)
  {
    if(!isNumber(time))
      return false;

    var seconds = pad(time % 60, 2);
    var minutes = pad(Math.floor((time / 60) % 60), 2);
    var hours = pad(Math.floor((time / 60 / 60) % 60), 2);

    return hours + ":" + minutes + ":" + seconds;

    // http://stackoverflow.com/a/10073788
    function pad(n, width, z) {
      z = z || '0';
      n = n + '';
      return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
    }
  };

  osftools.fromHumanTime = function (humantime)
  {
    var timeParts = humantime.split(':');
    var time = 0;

    if(timeParts.length < 2 || timeParts.length > 3)
      return false;

    for (var i = 0; i < timeParts.length; i++)
    {
      timeParts[i] = parseInt(timeParts[i], 10);

      if(isNaN(timeParts[i]))
      {
        return false;
      }

      time += timeParts[i] * Math.pow(60, timeParts.length - i - 1);
    }

    return time;
  };

  // http://stackoverflow.com/a/1830844/2486196
  function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  };
})();

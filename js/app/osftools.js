var osftools = {};

(function ()
{
  osftools.parseNotes = function (osf)
  {
    osf = osf.replace(/\s+$/g, '');
    var lines = osf.split('\n');
    var notes = [];
    var lastNote = {};

    for (var i = 0; i < lines.length; i++)
    {
      var line = lines[i];
      var note = osftools.parseNote(line, true);

      var hierarchy = note.hierarchy;
      delete note.hierarchy;

      note.notes = [];

      lastNote[hierarchy] = note;

      if(hierarchy > 0)
      {
        lastNote[hierarchy - 1].notes.push(note);
      }
      else
      {
        notes.push(note);
      }
    }

    return notes;
  }

  osftools.parseNote = function (osf, doHierarchy)
  {
    var note = { time: null, text: [], tags: [] };
    var parts = osf.split(' ');

    note.hierarchy = 0;

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

        note.time = time;
        continue;
      }

      if(i == 1 && part.match(/^-+$/))
      {
        note.hierarchy = part.length;
        continue;
      }

      if(part.indexOf('#') == 0)
      {
        note.tags.push(part.substr(1));
        continue;
      }

      note.text.push(part);
    }

    note.tags = osftools.normalizeTags(note.tags);
    note.text = note.text.join(' ');

    if(!doHierarchy)
      delete note.hierarchy;

    return note;
  };

  osftools.osfNotes = function (notes, hierarchy)
  {
    var osf = "";
    hierarchy = hierarchy || "";

    for (var i = 0; i < notes.length; i++)
    {
      var note = notes[i];
      osf += osftools.osfNote(note, hierarchy) + "\n";

      if(note.notes.length > 0)
      {
        osf += osftools.osfNotes(note.notes, hierarchy + "-");
      }
    }

    return osf;
  };

  osftools.osfNote = function (note, hierarchy)
  {
    var osf = "";
    if(!hierarchy)
    {
      hierarchy = "";
    }
    else
    {
      hierarchy = " " + hierarchy;
    }

    osf += osftools.toHumanTime(note.time);
    osf += hierarchy + " " + note.text;
    if(note.tags.length > 0)
      osf += " " + osftools.osfTags(note.tags);

    return osf;
  };

  osftools.osfTags = function (tags)
  {
    return "#" + tags.join(' #');
  }

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

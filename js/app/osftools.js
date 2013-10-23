var osftools = {};

(function ()
{
  osftools.cloneNote = function (note, includeChildren)
  {
    var clone = { time: 0, text: "", link: "", tags: [] };

    if(note.time)
      clone.time = note.time;
    if(note.link)
      clone.link = note.link;
    if(note.text)
      clone.text = note.text;
    if(note.tags && note.tags.length)
    {
      for (var i = 0; i < note.tags.length; i++)
      {
        clone.tags.push(note.tags[i]);
      }
    }

    if(includeChildren && note.notes && note.notes.length)
    {
      clone.notes = [];

      for (var i = 0; i < note.notes.length; i++)
      {
        clone.notes.push(osftools.cloneNote(note.notes[i], true));
      }
    }

    return clone;
  };

  osftools.notesEqual = function (note1, note2)
  {
    var attrs = ["time", "text", "link", "tags"];

    for (var i = 0; i < attrs.length; i++)
    {
      var attr = attrs[i];

      if (note1[attr] instanceof Array)
      {
        if (!(note2[attr] instanceof Array))
          return false;
        if (note1[attr].length != note2[attr].length)
          return false;

        for (var j = 0; j < note2[attr].length; j++)
        {
          if(note1[attr][j] !== note2[attr][j])
            return false;
        }
      }
      else if (note1[attr] !== note2[attr])
        return false;
    }

    return true;
  };

  osftools.sortNotes = function (notes)
  {
    notes.sort(
      function (n1, n2)
      {
        return n1.time - n2.time;
      }
    );

    for (var i = 0; i < notes.length; i++)
    {
      var nn = notes[i];

      if(nn.notes)
        osftools.sortNotes(nn.notes);
    }

    return notes;
  };

  osftools.countNotes = function (notes)
  {
    var count = 0;

    for (var i = 0; i < notes.length; i++)
    {
      count++;
      count += osftools.countNotes(notes[i].notes);
    }

    return count;
  };

  osftools.parseNotes = function (osf)
  {
    osf = osf.trim();
    var lines = osf.split('\n');
    var notes = [];
    var lastNote = {};
    var absoluteOffset = 0;
    var i = 0;
    var inHead = false;

    for (; i < lines.length; i++)
    {
      var line = lines[i];

      if(!inHead && !!osftools.parseNote(line))
        break; // no HEADER

      if(line == "HEAD" || line == "HEADER")
        inHead = true;
      if(line == "/HEAD" || line == "/HEADER")
        inHead = false;

      if(inHead)
        continue;

      i++; // skip /HEADER
      break;
    }

    for (; i < lines.length; i++)
    {
      var line = lines[i];

      if(absoluteOffset == 0)
      {
        var time = +line.split(' ')[0];
        if(!isNaN(time))
          absoluteOffset = time;
      }

      var note = osftools.parseNote(line, true);

      if(!note)
        continue;

      if(absoluteOffset > 0)
        note.time -= absoluteOffset;

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
    osf = osf.trim();

    if(osf.length == 0)
      return false;

    var note = { time: null, text: [], link: "", tags: [] };
    var parts = osf.split(' ');
    var gotTag = false;
    var gotLink = false;

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
        gotTag = true;
      }

      if (gotTag)
        continue;

      if(part.indexOf('<') == 0 && part.indexOf(">") == part.length - 1)
      {
        note.link = part.substr(1, part.length - 2);
        gotLink = true;
      }

      if (gotLink)
        continue;

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
    osf += hierarchy;
    if(note.text && note.text.length > 0)
      osf += " " + note.text;
    if(note.link && note.link.length > 0)
      osf += " <" + note.link + ">";
    if(note.tags && note.tags.length > 0)
      osf += " " + osftools.osfTags(note.tags);

    return osf.trim();
  };

  osftools.osfTags = function (tags)
  {
    return (tags.length > 0 ? "#" : "") + tags.join(' #');
  }

  osftools.normalizeTags = function (tags)
  {
    var mapping = {
      "c": "chapter",
      "q": "quote",
      "r": "revision",
      "g": "glossary"
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

  osftools.diffNotes = function (note1, note2)
  {
    var keys = osftools.getKeys(note1, note2);

    var changed = keys.filter(
      function (key)
      {
        if(key == "notes")
          return false;

        if(note1[key] instanceof Array)
        {
          if(!(note2[key] instanceof Array))
            return true;
          if(note2[key].length != note1[key].length)
            return true;

          for (var i = 0; i < note1[key].length; i++)
          {
            if(note2[key][i] != note1[key][i])
              return true;
          }

          return false;
        }
        else if(note2[key] != note1[key])
        {
          return true;
        }

        return false;
      }
    );

    return changed;
  };

  osftools.getKeys = function (/* args.. */)
  {
    var keys = [];

    for (var i = 0; i < arguments.length; i++)
    {
      var arg = arguments[i];
      var argKeys = Object.keys(arg);

      for (var j = 0; j < argKeys.length; j++)
      {
        var argKey = argKeys[j];

        if(keys.indexOf(argKey) == -1)
          keys.push(argKey);
      }
    }

    return keys;
  };

  // http://stackoverflow.com/a/1830844/2486196
  function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  };
})();

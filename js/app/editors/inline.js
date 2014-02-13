(function ()
{
  var self = {};

  var editorHtml =
    '<div class="editor inline">' +
      '<input type="text" class="time">' +
      '<input type="text" class="text">' +
    '</div>';

  shownoteseditor.editors.inline = function (options, player, cb)
  {
    console.log("inline init", options);

    this.player = player;

    this.editor = {};
    this.editor.main = $(editorHtml);
    this.editor.main.prop('id', "editor_" + options.id);

    this.editor.time = this.editor.main.find('.time');
    this.editor.time.keyup(this.onContentChanged.bind(this));
    this.editor.time.keyup(this.onKeyPress.bind(this));

    this.editor.text = this.editor.main.find('.text');
    this.editor.text.keyup(this.onContentChanged.bind(this));
    this.editor.text.keyup(this.onKeyPress.bind(this));

    this.updateTime = true;

    if(options.content)
    {
      this.updateTime = false;
      this.setContent(options.content);
    }

    $(options.element).append(this.editor.main);
    setTimeout(function () { this.editor.text.focus(); }.bind(this), 50);

    this.id = options.id;

    this.lastSetTime = null;
    this.timeInterval = setInterval(this.autoUpdateTime.bind(this), 500);
    this.autoUpdateTime();

    cb();
  };

  self.autoUpdateTime = function ()
  {
    if(this.updateTime)
    {
      var time = this.player.getCurrentTime();
      var now = this.getContent().time;

      if(this.lastSetTime != now && this.lastSetTime !== null)
        return;

      this.setContent({ time: time });

      this.lastSetTime = time;
    }
  };

  self.close = function ()
  {
    clearInterval(this.timeInterval);
    this.editor.main.remove();
  };

  self.getContent = function ()
  {
    var time = this.editor.time.val();
    var text = this.editor.text.val();
    var parts = text.split(' ');
    var link = null;

    text = "";

    for (var i = 0; i < parts.length; i++) {
      var part = parts[i];

      if(part.indexOf("http://") === 0 || part.indexOf("https://") === 0)
      {
        link = part;
      }
      else
      {
        text += (i === 0) ? "" : " ";
        text += part;
      }
    }

    var note = osftools.parseNote(time + " " + text);

    if(link)
    {
      note.link = link;
    }

    return note;
  };

  self.setContent = function (note)
  {
    if(note.time !== undefined)
    {
      var start = this.editor.time[0].selectionStart,
            end = this.editor.time[0].selectionEnd;

      this.editor.time.val(osftools.toHumanTime(note.time));

      if(this.editor.time.is(":focus"))
        this.editor.time[0].setSelectionRange(start, end);
    }

    var textParts = [];

    if(typeof note.text == "string" && note.text.length > 0)
    {
      textParts.push(note.text);
    }
    if(typeof note.link == "string" && note.link.length > 0)
    {
      textParts.push(note.link);
    }
    if(note.tags instanceof Array && note.tags.length > 0)
    {
      textParts.push(osftools.osfTags(note.tags));
    }

    if(textParts.length > 0)
    {
      var text = textParts.join(" ");
      this.editor.text.val(text);
    }

    if(note.text === null)
    {
      this.editor.text.val("");
    }
  };

  self.onContentChanged = function ()
  {
    var content = this.getContent();
    if(!this.lastContent || !osftools.notesEqual(content, this.lastContent))
      this.trigger('contentChanged', this.id, content);
    this.lastContent = content;
  };

  self.onKeyPress = function (e)
  {
    if(e.which == 13) // enter
    {
      if(this.editor.text.val() === "")
      {
        this.triggerCancel();
      }
      else
      {
        this.triggerSubmit();
      }
    }
    else if(e.which == 27) // esc
    {
      this.triggerCancel();
    }
    else
    {
      if (e.keyCode == 37 ||
          e.keyCode == 38 ||
          e.keyCode == 39 ||
          e.keyCode == 40)
        return; // arrow keys

      this.updateTime = false;
    }
  };

  self.triggerSubmit = function ()
  {
    var content = this.getContent();
    this.trigger('submitted', this.id, content);
    this.clear();
  };

  self.triggerCancel = function ()
  {
    this.trigger('canceled', this.id);
    this.clear();
  };

  self.clear = function ()
  {
    this.setContent({ time: 0, text: null });
    this.lastSetTime = null;
    this.updateTime = true;
  };

  shownoteseditor.editors.inline.prototype = self;
  MicroEvent.mixin(shownoteseditor.editors.inline);
})();

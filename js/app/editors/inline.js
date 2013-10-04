(function ()
{
  var self = {};

  var editorHtml =
    '<div class="editor inline">' +
      '<input type="text" class="time" placeholder="00:00:00">' +
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
    this.editor.text.keyup(this.onTextChanged.bind(this));
    this.editor.text.keyup(this.onKeyPress.bind(this));

    this.setTimeOnEdit = true;

    if(options.content)
    {
      this.setTimeOnEdit = false;
      this.setContent(options.content);
    }

    $(options.element).append(this.editor.main);
    setTimeout(function () { this.editor.text.focus(); }.bind(this), 50);

    this.id = options.id;

    cb();
  };

  self.close = function ()
  {
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

      if(part.indexOf("http://") == 0)
      {
        link = part;
      }
      else
      {
        text += i == 0 ? "" : " ";
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
    if(note.time != undefined)
    {
      this.editor.time.val(osftools.toHumanTime(note.time));
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

    if(note.text == null)
    {
      this.editor.text.val("");
    }
  };

  self.onContentChanged = function ()
  {
    var content = this.getContent();
    this.trigger('contentChanged', this.id, content);
  };

  self.onTextChanged = function ()
  {
    if(this.editor.text.val().length == 0)
    {
      this.setTimeOnEdit = true;
    }
    else if(this.setTimeOnEdit)
    {
      this.setTimeOnEdit = false;
      this.setCurrentTime();
    }
  }

  self.setCurrentTime = function ()
  {
    var time = this.player.getCurrentTime();
    this.setContent({ time: time });
  }

  self.onKeyPress = function (e)
  {
    if(e.which == 13) // enter
    {
      this.triggerSubmit();
    }
  }

  self.triggerSubmit = function ()
  {
    var content = this.getContent();
    this.trigger('submitted', this.id, content);
    this.setContent({ time: 0, text: null });
    this.setTimeOnEdit = true;
  }

  shownoteseditor.editors.inline.prototype = self;
  MicroEvent.mixin(shownoteseditor.editors.inline);
})();

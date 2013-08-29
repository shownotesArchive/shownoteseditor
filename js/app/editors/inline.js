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
    this.editor.text.keyup(this.onTextChanged.bind(this));
    this.editor.text.keyup(this.onKeyPress.bind(this));

    this.setTimeOnEdit = true;

    if(options.content)
      setContent(options.content);

    $(options.element).append(this.editor.main);

    this.id = options.id;

    cb();
  };

  self.close = function ()
  {
    $.remove(this.editor.prop('id'));
  };

  self.currentTimeChanged = function (time)
  {
    var humanTime = osftools.toHumanTime(time);
    this.editor.time.text(humanTime);
  }

  self.getContent = function ()
  {
    var time = this.editor.time.val();
    var text = time + " " + this.editor.text.val();

    return osftools.parseNote(text);
  };

  self.setContent = function (note)
  {
    if(note.time != undefined)
      this.editor.time.val(osftools.toHumanTime(note.time));
    if(note.text != undefined)
    {
      this.editor.text.val(note.text);
      if(note.tags != undefined)
        this.editor.text.val(note.text + note.tags.join(' '));
    }
  }

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
    this.setContent({ time: 0, text: "" });
    this.setTimeOnEdit = true;
  }

  shownoteseditor.editors.inline.prototype = self;
  MicroEvent.mixin(shownoteseditor.editors.inline);
})();

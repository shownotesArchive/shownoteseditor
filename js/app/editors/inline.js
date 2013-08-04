(function ()
{
  var self = {};

  var editorHtml =
    '<div class="editor inline">' +
      '<input type="text" class="time">' +
      '<input type="text" class="text">' +
    '</div>'

  shownoteseditor.editors.inline = function (options, cb)
  {
    console.log("inline init", options);

    this.editor = {};
    this.editor.main = $(editorHtml);
    this.editor.main.prop('id', "editor_" + options.id);

    this.editor.time = this.editor.main.find('.time');
    this.editor.time.change(self.onContentChanged);

    this.editor.text = this.editor.main.find('.text');
    this.editor.text.change(self.onContentChanged);

    this.id = options.id;

    cb();
  };

  self.close = function ()
  {
    $.remove(this.editor.prop('id'));
  };

  self.getContent = function ()
  {
    var time = parseInt(this.editor.time, 10);
    var text = this.editor.text.text();

    return { text: text, time: time };
  };

  self.onContentChanged = function ()
  {
    var content = this.getContent();
    this.trigger('contentChanged', content);
  };

  shownoteseditor.editors.inline.prototype = self;
  MicroEvent.mixin(shownoteseditor.editors.inline);
})();

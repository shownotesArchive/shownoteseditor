(function ()
{
  var self = {};

  var mainTemplate = "<ul id='notes'></ul>";
  var noteTemplate = "<li data-id=''><span class='time'></span> <span class='text'></span><ul class='tags'></ul><ul class='subnotes'></ul></li>";
  var tagTemplate = "<li></li>";

  shownoteseditor.lists.standard = function (options, cb)
  {
    console.log("List-Standard init", options);

    $(options.element).replaceWith(mainTemplate);
    this.element = $('#notes');

    cb();
  };

  self.addNote = function (id, note, parent)
  {
    var $note = $(noteTemplate);
    $note.attr('data-id', id);
    $note.find('.time').text(osftools.toHumanTime(note.time));
    $note.find('.text').text(note.text);

    var $tags = $note.find('.tags');
    for (var tag in note.tags)
    {
      tag = note.tags[tag];
      var $tag = $(tagTemplate);
      $tag.text(tag);
      $tags.append($tag);
    }

    if(parent == "_root")
    {
      this.element.append($note);
    }
    else
    {
      var $parent = this.element.find("li[data-id=" + parent + "]");
      $parent.append($note);
    }
  };

  self.removeNote = function (id)
  {
  };

  self.editNote = function (id, note)
  {
  };

  shownoteseditor.lists.standard.prototype = self;
  MicroEvent.mixin(shownoteseditor.lists.standard);
})();

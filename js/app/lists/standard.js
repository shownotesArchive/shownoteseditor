(function ()
{
  var self = {};

  var mainTemplate = "<ul class='list standard'></ul>";
  var noteTemplate = "<li data-id='' class='note'>"
                   +   "<span class='time'></span>"
                   +   "<span class='text'></span>"
                   +   "<ul class='tags'></ul>"
                   +   "<div class='controls'>"
                   +   "</div>"
                   +   "<ul class='subnotes'></ul>"
                   + "</li>";
  var tagTemplate = "<li></li>";
  var controlTemplate = "<i></i>";

  shownoteseditor.lists.standard = function (options, cb)
  {
    console.log("List-Standard init", options);

    $(options.element).replaceWith(mainTemplate);
    this.element = $("ul.list.standard:first");

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

    var $controls = $note.find('.controls');
    var controls = {
      remove: { icon: "icon-trash", func: userRemoveNote }
    };

    for(var name in controls)
    {
      var control = controls[name];
      controls[name].func = controls[name].func.bind(this);

      var $control = $(controlTemplate);
      $control.attr('data-name', name);
      $control.addClass(name);
      $control.addClass(control.icon);
      $control.click(function ()
        {
          var name = $(this).attr("data-name");
          controls[name].func(id);
        }
      );

      $controls.append($control);
    }

    var $parent;

    if(parent == "_root")
    {
      $parent = this.element;
    }
    else
    {
      $parent = this.element.find("li[data-id=" + parent + "] ul.subnotes");
    }

    $parent.append($note);
  };

  self.removeNote = function (id)
  {
    var $note = this.element.find('li[data-id=' + id + ']');
    $note.remove();
  };

  self.editNote = function (id, note)
  {
  };

  function userRemoveNote(id)
  {
    this.trigger("removeRequested", id);
  }

  shownoteseditor.lists.standard.prototype = self;
  MicroEvent.mixin(shownoteseditor.lists.standard);
})();

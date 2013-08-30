(function ()
{
  var self = {};

  var mainTemplate = "<ul class='list standard'></ul>";
  var noteTemplate = "<li data-id='' class='note'>"
                   +   "<span class='time'></span>"
                   +   "<span class='text'></span>"
                   +   "<ul class='tags'></ul>"
                   +   "<div class='editorWrapper'></div>"
                   +   "<div class='controls'>"
                   +   "</div>"
                   +   "<ul class='subnotes'>"
                   +     "<li class='addSubnote'><i class='icon-plus addSubnote'></i></li>"
                   +   "</ul>"
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

    setHtmlNote($note, note);

    var $controls = $note.find('.controls');
    var controls = {
      remove: { icon: "icon-trash", func: userRemoveNote },
      edit: { icon: "icon-edit", func: userEditNote }
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

    var that = this;

    $note.find('i.addSubnote').click(
      function ()
      {
        userAddSubnote(id).bind(that);
      }
    );

    var $parent;

    if(parent == "_root")
    {
      var $parent = this.element;
      $parent.append($note);
    }
    else
    {
      var $addSubnote = this.element.find("li[data-id=" + parent + "] ul.subnotes > li.addSubnote");
      $addSubnote.before($note);
    }
  };

  function setHtmlNote($note, note)
  {
    $note.find('> .time').text(osftools.toHumanTime(note.time));
    $note.find('> .text').text(note.text);

    var $tags = $note.find('> .tags');
    $tags.empty();
    for (var tag in note.tags)
    {
      tag = note.tags[tag];
      var $tag = $(tagTemplate);
      $tag.text(tag);
      $tags.append($tag);
    }
  }

  self.removeNote = function (id)
  {
    var $note = this.findHtmlNote(id);
    $note.remove();
  };

  self.editNote = function (id, note)
  {
    var $note = this.findHtmlNote(id);
    setHtmlNote($note, note);
  };

  self.findHtmlNote = function (id)
  {
    return this.element.find('li[data-id=' + id + ']');
  }

  function userRemoveNote(id)
  {
    this.trigger("removeRequested", id);
  }

  function userEditNote(id)
  {
    var $note = this.findHtmlNote(id);
    var $editor = $note.find('.editorWrapper');

    this.trigger("editRequested", id, $editor[0], editEnded);
    $note.addClass("editing");

    function editEnded()
    {
      $note.removeClass("editing");
      $editor.empty();
    }
  }

  function userAddSubnote(parentId)
  {
    alert(parentId);
  }

  shownoteseditor.lists.standard.prototype = self;
  MicroEvent.mixin(shownoteseditor.lists.standard);
})();

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
                   +   "</ul>"
                  +    "<div class='addSubnote noSubnotes'>"
                  +      "<div class='editorWrapper'></div>"
                  +      "<i class='icon-plus addSubnote'></i>"
                  +    "</div>"
                   + "</li>";
  var tagTemplate = "<li></li>";
  var controlTemplate = "<i></i>";

  shownoteseditor.lists.standard = function (options, cb)
  {
    console.log("List-Standard init", options);

    $(options.element).append(mainTemplate);
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

    $note.find('i.addSubnote').click(
      function ()
      {
        userAddSubnote.call(this, id);
      }.bind(this)
    );

    var $parent;

    if(parent == "_root")
    {
      var $parent = this.element;
      $parent.append($note);
    }
    else
    {
      var $subnotes = this.element.find("li[data-id=" + parent + "] > ul.subnotes");
      $subnotes.parents(".note:first").find('> .addSubnote').removeClass('noSubnotes');
      $subnotes.append($note);
    }
  };

  function setHtmlNote($note, note)
  {
    $note.find('> .time').text(osftools.toHumanTime(note.time));
    $note.find('> .text').text(note.text);
    $note.attr('data-time', note.time);

    var classes = $note.attr('class').split(' ');
    for (var i = 0; i < classes.length; i++) {
      var cls = classes[i];
      if(cls.indexOf("tag-") == 0)
        $note.removeClass(cls);
    }

    var $tags = $note.find('> .tags');
    $tags.empty();
    for (var tag in note.tags)
    {
      tag = note.tags[tag];
      var $tag = $(tagTemplate);
      $tag.text(tag);
      $tags.append($tag);
      $note.addClass("tag-" + tag);
    }
  }

  self.removeNote = function (id)
  {
    var $note = this.findHtmlNote(id);
    var $subnotes = $note.parents('.subnotes:first');
    $note.remove();

    if($subnotes.children().length == 0)
      $subnotes.parents(".note:first").find('> .addSubnote').addClass('noSubnotes');
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
    var $editorWrapper = $note.find('.editorWrapper');

    this.trigger("editRequested", id, $editorWrapper[0], editEnded);
    $note.addClass("editing");

    function editEnded()
    {
      $note.removeClass("editing");
      $editorWrapper.empty();
    }
  }

  function userAddSubnote(parentId)
  {
    var $note = this.findHtmlNote(parentId);
    var $addSubnote = $note.children('.addSubnote');
    var $editorWrapper = $addSubnote.children('.editorWrapper');

    this.trigger("addRequested", parentId, $editorWrapper[0], editEnded);
    $addSubnote.addClass("editing");
    $addSubnote.removeClass('noSubnotes');

    function editEnded(success)
    {
      $addSubnote.removeClass("editing");
      $editorWrapper.empty();

      if(!success)
      {
        $addSubnote.addClass('noSubnotes');
      }
    }
  }

  shownoteseditor.lists.standard.prototype = self;
  MicroEvent.mixin(shownoteseditor.lists.standard);
})();

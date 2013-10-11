(function ()
{
  var self = {};

  var mainTemplate = "<ul class='list standard'></ul>";
  var noteTemplate = "<li data-id='' class='note'>"
                   +   "<div class='controls'>"
                   +   "</div>"
                   +   "<span class='time'></span>"
                   +   "<span class='text'></span>"
                   +   "<a class='link' target='_blank'></a>"
                   +   "<ul class='tags'></ul>"
                   +   "<div class='editorWrapper'></div>"
                   +   "<ul class='subnotes'>"
                   +   "</ul>"
                  +    "<div class='addSubnote'>"
                  +      "<div class='editorWrapper'></div>"
                  +    "</div>"
                   + "</li>";
  var tagTemplate = "<li></li>";
  var controlTemplate = "<i></i>";

  shownoteseditor.lists.standard = function (options, cb)
  {
    console.log("List-Standard init", options);

    $(options.element).append(mainTemplate);
    this.element = $("ul.list.standard:first");

    this.shouldScroll = options.shouldScroll;

    cb();
  };

  self.addNote = function (id, note, parent)
  {
    var $note = $(noteTemplate);
    $note.attr('data-id', id);

    setHtmlNote($note, note);

    var $controls = $note.find('.controls');
    var controls = {
      remove: { icon: "icon-trash", tooltip: "Remove", func: userRemoveNote },
      edit: { icon: "icon-edit", tooltip: "Edit", func: userEditNote },
      addSubnote: { icon: "icon-plus", tooltip: "Add", func: userAddSubnote }
    };

    for(var name in controls)
    {
      var control = controls[name];
      controls[name].func = controls[name].func.bind(this);

      var $control = $(controlTemplate);
      $control.attr('data-name', name);
      $control.attr('title', control.tooltip);
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

    $note.find('.time').click(
      function ()
      {
        userJumpTime.call(this, id);
      }.bind(this)
    );

    var $parent;

    if(parent == "_root")
    {
      $parent = this.element;
    }
    else
    {
      $parent = this.element.find("li[data-id=" + parent + "] > ul.subnotes");
    }

    var $notes = $parent.children();
    var added = false;

    for (var i = 0; i < $notes.length; i++)
    {
      var $eNote = $($notes[i]);

      if(+$eNote.attr('data-time') > note.time)
      {
        $note.insertBefore($eNote);
        added = true;
        break;
      }
    }

    if(!added)
    {
      $parent.append($note);

      if(this.shouldScroll && this.isLoadFinished)
      {
        var $p = this.element.parent();
        $p.scrollTop($p[0].scrollHeight);
      }
    }

  };

  function setHtmlNote($note, note)
  {
    $note.find('> .time').text(osftools.toHumanTime(note.time));
    $note.find('> .text').text(note.text);
    $note.find('> .link').text(note.link).prop("href", note.link);
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
  };

  self.editNote = function (id, note)
  {
    var $note = this.findHtmlNote(id);
    setHtmlNote($note, note);
  };

  self.findHtmlNote = function (id)
  {
    return this.element.find('li[data-id=' + id + ']');
  };

  self.loadFinished = function ()
  {
    this.isLoadFinished = true;
  };

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

    if($addSubnote.hasClass("editing"))
      return;

    this.trigger("addRequested", parentId, $editorWrapper[0], editEnded);
    $addSubnote.addClass("editing");

    function editEnded(success)
    {
      $addSubnote.removeClass("editing");
      $editorWrapper.empty();
    }
  }

  function userJumpTime(id)
  {
    this.trigger("jumpRequested", id);
  }

  shownoteseditor.lists.standard.prototype = self;
  MicroEvent.mixin(shownoteseditor.lists.standard);
})();

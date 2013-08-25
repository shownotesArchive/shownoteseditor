(function ()
{
  var self = {};

  var mainTemplate = "<ul id='notes'></ul>";
  var noteTemplate = "<li><span class='time'></span><span class='text'></span><br><ul class='subnotes'></ul></li>";

  shownoteseditor.lists.standard = function (options, cb)
  {
    console.log("List-Standard init", options);

    $(options.element).replaceWith(mainTemplate);
    this.element = $('#notes');

    cb();
  };

  self.addNote = function (note, parent)
  {
  };

  self.removeNote = function (id)
  {
  };

  self.editNote = function (id, note)
  {
  };

  shownoteseditor.lists.standard.prototype = self;
})();

shownoteseditor.utils = {};

(function ()
{
  shownoteseditor.utils.loadNotes = function (connector, notes, cb, parent)
  {
    if(!parent)
    {
      parent = "_root";
    }

    async.each(notes,
      function (note, cb)
      {
        note = osftools.cloneNote(note, true);

        async.waterfall(
          [
            function (cb)
            {
              connector.addNote(note, parent, cb);
            },
            function (id, cb)
            {
              if(note.notes && note.notes.length !== 0)
                shownoteseditor.utils.loadNotes(connector, note.notes, cb, id);
              else
                cb();
            }
          ],
          cb
        );
      },
      cb
    );
  };
})();

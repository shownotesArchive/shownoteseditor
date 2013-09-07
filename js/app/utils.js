shownoteseditor.utils = {};

(function ()
{
  shownoteseditor.utils.loadNotes = function (connector, notes, cb, parent)
  {
    if(!parent)
    {
      parent = "_root";
    }

    async.eachSeries(notes,
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
              if(note.notes && note.notes.length != 0)
                shownoteseditor.utils.loadNotes(connector, note.notes, cb, id);
              else
                cb();
            }
          ],
          cb
        )
      },
      cb
    );
  };

  shownoteseditor.utils.clearNotes = function (connector, cb)
  {
    async.waterfall(
      [
        function (cb)
        {
          connector.getNotes(cb);
        },
        function (notes, cb)
        {
          var ids = Object.keys(notes.notes);
          async.eachSeries(ids,
            function (id, cb)
            {
              connector.removeNote(id, cb);
            },
            cb
          );
        }
      ],
      cb
    );
  };
})();

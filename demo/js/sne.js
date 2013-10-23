if(typeof sne == "undefined") sne = { steps: {} };
sne.steps.sne = {};

(function ()
{
  var $txtOsf = $('#txtOsf');

  sne.steps.sne.show = function ()
  {
    $('#initwrapper').css('display', 'none');
    $('#sneWrapper').addClass('active');
    $('body').css('overflow', 'hidden');

    var player = sne.doc.player;
    player.options.element = $("#player")[0];

    var options =
    {
      connector:
      {
        name: sne.connectorName,
        options:
        {
          docid: sne.doc.id
        }
      },
      ui:
      {
        player: player,
        list:
        {
          name: "standard",
          options:
          {
            element: $('#notes')[0],
            shouldScroll: true
          }
        },
        editor:
        {
          name: "inline",
          options:
          {
            element: $('#maineditor')[0]
          }
        }
      }
    };

    for (var opt in sne.connectorOptions)
    {
      options.connector.options[opt] = sne.connectorOptions[opt];
    }

    $('#notes, #maineditor, #player').empty();
    $('#txtOsf').val('');

    sne.main = new shownoteseditor.sne(options,
      function (err)
      {
        console.log("done, err=%s", err);
      }
    );
  };

  sne.steps.sne.hide = function ()
  {
    $('#sneWrapper').removeClass('active');
    $('body').css('overflow', '');
    $('#initwrapper').css('display', 'block');
  };

  $('#btnShowDocChooser').click(
    function ()
    {
      sne.steps.sne.hide();
      sne.steps.docchooser.show(
        function ()
        {
          sne.steps.sne.show(function (){});
        }
      );
    }
  );

  $('#btnShowImportExport').click(
    function ()
    {
      var $exportImport = $('#exportImport');
      $exportImport.toggleClass('hidden');
      if($exportImport.hasClass('hidden'))
      {
        move("#exportImport").set("right", -550).end();
      }
      else
      {
        move("#exportImport").set("right", 0).end();
      }
    }
  );

  $('#btnExport').click(
    function ()
    {
      sne.main.connector.getFriendlyJson(
        function (err, notes)
        {
          if(err)
            return alert(err);

          var osf = osftools.osfNotes(notes);
          $txtOsf.val(osf);
        }
      );
    }
  );

  $('#btnImport').click(
    function ()
    {
      var res = confirm("This is going to delete all notes from your document.\nAre you sure that this is what you want?");

      if(res)
      {
        var osf = $txtOsf.val();
        var notes = osftools.parseNotes(osf);
        sne.main.loadNotes(notes);
      }
    }
  );
})();

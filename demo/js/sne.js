if(typeof sne == "undefined") sne = { steps: {} };
sne.steps.sne = {};

(function ()
{
  var sneCallback = null;

  sne.steps.sne.show = function (cb)
  {
    sneCallback = cb;
    $('#sneWrapper').addClass('active');

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
        player:
        {
          name: "audiojs",
          options:
          {
            element: $("#player")[0],
            files: sne.files
          }
        },
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
    sneCallback();
  };
})();

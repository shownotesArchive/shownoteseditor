var $docs = $('#docs');
var $txtOsf = $('#txtOsf');

if(typeof sne == "undefined") sne = {};
sne.connectorName = "firebase";
sne.connectorOptions = { };

var steps = [ "login", "docchooser", "sne" ];

async.eachSeries(
  steps,
  function (step, cb)
  {
    sne.steps[step].show(cb);
  }
);

$('#btnShowDocChooser').click(
  function ()
  {
    showDocChooser();
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
    var osf = $txtOsf.val();
    var notes = osftools.parseNotes(osf);
    sne.loadNotes(notes);
  }
);

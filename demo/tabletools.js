var tabletools = {};

(function ()
{
  tabletools.clear = function ($table)
  {
    var $tbody = $table.find('tbody:first');
    $tbody.empty();
  };

  tabletools.addRow = function ($table, data)
  {
    var $tbody = $table.find('tbody:first');
    var $tr = $('<tr>');

    for (var i = 0; i < data.length; i++)
    {
      var dat = data[i];
      var $td = $('<td>');

      if(typeof dat == "string")
        $td.text(dat);
      else
        $td.append(dat);

      $tr.append($td);
    }

    $tbody.append($tr);
    return $tr;
  };

})();

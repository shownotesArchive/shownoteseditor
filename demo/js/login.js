if(typeof sne == "undefined") sne = { steps: {} };
sne.steps.login = {};

(function ()
{
  var $loginFields = $('#loginFields');
  var $registerFields = $('#registerFields');
  var loginCallback = null;
  var lockIntervalId = 0;

  sne.steps.login.show = function (cb)
  {
    var reg = shownoteseditor.connectors[sne.connectorName].registration;
    loginCallback = cb;

    if(!reg.needsRegistration)
      return loginCallback();

    lockIntervalId = setInterval(animateLock, 1000);
    fillForms(reg);
  };

  sne.steps.login.hide = function ()
  {
    $('#login').removeClass('active');
    $('#loginLocks').css('display', 'none');
    clearInterval(lockIntervalId);
    loginCallback();
  };

  function animateLock()
  {
    $('#loginLocks > i').toggle();
  }

  function fillForms(reg)
  {
    shownoteseditor.connectors[sne.connectorName].login(
      sne.connectorOptions,
      function (err)
      {
        if (!err)
          return sne.steps.login.hide();

        for (var i = 0; i < reg.loginFields.length; i++)
        {
          addField($loginFields, reg.loginFields[i]);
        }

        for (var i = 0; i < reg.registerFields.length; i++)
        {
          addField($registerFields, reg.registerFields[i])
        }

        $('#login').addClass('active');
      }
    );

    function addField($parent, field)
    {
      var $field = $('<div><span></span><input></div>');
      $field.find('span').text(field + ": ");
      $field.find('input').attr('data-name', field);
      $parent.append($field);
    }
  }

  $('#loginSubmit').click(
    function ()
    {
      var reg = shownoteseditor.connectors[sne.connectorName].registration;
      sne.connectorOptions.auth = {};

      for (var i = 0; i < reg.loginFields.length; i++) {
        var field = reg.loginFields[i];
        var val = $loginFields.find('input[data-name=' + field + ']').val();
        sne.connectorOptions.auth[field] = val;
      }

      shownoteseditor.connectors[sne.connectorName].login(
        sne.connectorOptions,
        function (err)
        {
          if(err)
          {
            $('#loginError').text(err);
          }
          else
          {
            sne.steps.login.hide();
          }
        }
      );
    }
  );

  $('#registerSubmit').click(
    function ()
    {
      alert("todo");
    }
  )
})();

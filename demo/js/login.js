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
    $('#logout').show();
    stopLockAnimation();
    loginCallback();
  };

  function animateLock()
  {
    $('#loginLocks > i').toggle();
  }

  function stopLockAnimation()
  {
    $('#loginLocks').css('display', 'none');
    clearInterval(lockIntervalId);
  }

  function fillForms(reg)
  {
    shownoteseditor.connectors[sne.connectorName].login(
      sne.connectorOptions,
      function (err, uid)
      {
        if (!err)
          return sne.steps.login.hide();

        sne.uid = uid;

        for (var i = 0; i < reg.loginFields.length; i++)
        {
          addField($loginFields, reg.loginFields[i], submitLogin);
        }

        for (var i = 0; i < reg.registerFields.length; i++)
        {
          addField($registerFields, reg.registerFields[i], submitRegister);
        }

        $('#logout').hide();
        $('#login').addClass('active');
        stopLockAnimation();
      }
    );

    function addField($parent, field, submit)
    {
      var $field = $('<div class="field"><span></span><input></div>');
      var $text = $field.children('span');
      var $input = $field.children('input');

      var text = field;
      text = text.charAt(0).toUpperCase() + text.slice(1);
      $text.text(text);

      $input.attr('data-name', field);
      if(field == "password")
        $input.attr('type', 'password');
      $input.keypress(
        function (e)
        {
          if(e.which == 13)
            submit();
        }
      );

      $parent.append($field);
    }
  }

  $('#loginSubmit').click(submitLogin);
  $('#registerSubmit').click(submitRegister);
  $('#l_twitter').click(twitterLogin);
  $('#logout').click(submitLogout);

  function submitLogin ()
  {
    var reg = shownoteseditor.connectors[sne.connectorName].registration;
    sne.connectorOptions.auth = getFieldData($loginFields, reg.loginFields);
    sne.connectorOptions.auth.provider = "password";
    execLogin ();
  }

  function twitterLogin ()
  {
    sne.connectorOptions.auth = { provider: "twitter" };
    execLogin ();
  }

  function execLogin ()
  {
    shownoteseditor.connectors[sne.connectorName].login(
      sne.connectorOptions,
      function (err, uid)
      {
        if(err)
        {
          $('#loginError').text(err);
        }
        else
        {
          sne.uid = uid;
          sne.steps.login.hide();
        }
      }
    );
  }

  function submitRegister ()
  {
    var reg = shownoteseditor.connectors[sne.connectorName].registration;
    var regFields = getFieldData($registerFields, reg.registerFields);

    shownoteseditor.connectors[sne.connectorName].register(
      regFields,
      function (err)
      {
        if(err)
        {
          $('#registerStatus').addClass('error').text(err);
        }
        else
        {
          sne.connectorOptions.auth = regFields;
          sne.connectorOptions.auth.provider = "password";
          execLogin();
        }
      }
    );
  }

  function submitLogout ()
  {
    shownoteseditor.connectors[sne.connectorName].logout(
      function (err)
      {
        location.reload();
      }
    );
  }

  function getFieldData($fields, fields)
  {
    var auth = {};

    for (var i = 0; i < fields.length; i++)
    {
      var field = fields[i];
      var val = $fields.find('input[data-name=' + field + ']').val();
      auth[field] = val;
    }

    return auth;
  }
})();

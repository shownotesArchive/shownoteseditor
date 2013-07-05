var shownoteseditor;

(function ()
{
  var self = {};

  self.init = function (options, cb)
  {
    console.log("Main init", options);

    async.series(
      [
        function (cb)
        {
          var i18nOptions =
          {
            resGetPath: 'i18n/__lng__/__ns__.json',
            fallbackLng: 'en',
            preload: [ "de" ]
          };

          i18n.init(i18nOptions,
            function ()
            {
              cb();
            }
          );
        },
        function (cb)
        {
          self.connector = self.connectors[options.connector.name];

          if(!self.connector)
            return cb("Invalid connector name");

          self.connector.init(options.connector.options, cb);
        },
        function (cb)
        {
          self.ui.init(options, cb);
        }
      ],
      cb
    );

  };

  self.connectors = {};
  self.players = {};

  shownoteseditor = self;
})();

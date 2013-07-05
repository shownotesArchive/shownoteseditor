var shownoteseditor;

(function ()
{
  var self = {};

  self.init = function (options, cb)
  {
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
          self.connector = self.connectors[options.connector];

          if(!self.connector)
            return cb("Invalid connector name");

          self.connector.init({}, cb);
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

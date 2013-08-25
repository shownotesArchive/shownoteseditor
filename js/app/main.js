var shownoteseditor = {
  connectors: {},
  editors: {},
  players: {}
};

(function ()
{
  var self = {};

  shownoteseditor.editor = function (options, cb)
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
          if(Object.keys(shownoteseditor.connectors).indexOf(options.connector.name) == -1)
            return cb("Invalid connector name");

          var connector = shownoteseditor.connectors[options.connector.name];
          this.connector = new connector(options.connector.options, cb);
        },
        function (cb)
        {
          this.ui = new shownoteseditor.ui(options, cb);
        }
      ],
      cb
    );
  };

  shownoteseditor.editor.prototype = self;
})();

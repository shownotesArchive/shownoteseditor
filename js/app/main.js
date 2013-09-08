var shownoteseditor = {
  connectors: {},
  editors: {},
  players: {},
  lists: {}
};

(function ()
{
  var self = {};

  shownoteseditor.sne = function (options, cb)
  {
    console.log("Main init", options);

    var that = this;

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
          that.connector = new connector(options.connector.options, function () {});
          cb();
        },
        function (cb)
        {
          that.ui = new shownoteseditor.ui(options.ui, that.connector, function () {});
          cb();
        }
      ],
      cb
    );
  };

  self.loadNotes = function (notes, cb)
  {
    var that = this;

    async.series(
      [
        function (cb)
        {
          shownoteseditor.utils.clearNotes(that.connector, cb);
        },
        function (cb)
        {
          shownoteseditor.utils.loadNotes(that.connector, notes, cb);
        }
      ],
      cb
    );
  };

  shownoteseditor.sne.prototype = self;
})();

(function ()
{
  var self = {};
  var idRefMap = {};

  shownoteseditor.connectors.firebase = function (options, cb)
  {
    console.log("firebase init", options);

    getUserRef(options,
      function (err, userRef)
      {
        if(err)
          return cb(err);

        this.userRef = userRef;
        this.docRef = this.userRef.child('docs/' + options.docid);
        this.notesRef = this.docRef.child('notes');
        this.notesRef.on('child_added', fireChildAdded, this);
        this.notesRef.on('child_removed', fireChildRemoved, this);

        idRefMap["_root"] = this.notesRef;

        cb();
      }.bind(this)
    );
  };

  function getUserRef (options, cb)
  {
    var rootRef = new Firebase('https://sne.firebaseIO.com/');
    var gotLoginCallback = false;

    var auth = new FirebaseSimpleLogin(rootRef,
      function(error, user)
      {
        if (error) {
          cb(error);
        } else if (user) {
          var userRef = rootRef.child('users/' + user.id + '/');
          cb(null, userRef, user.id);
        } else if(gotLoginCallback) {
          cb("Not logged in");
        } else {
          gotLoginCallback = true;
        }
      }
    );

    if(options.auth &&
       typeof options.auth.email == "string" &&
       typeof options.auth.password  == "string")
    {
      auth.login('password', {
        email: options.auth.email,
        password: options.auth.password,
        rememberMe: true
      });
    }
    else
    {
      gotLoginCallback = true;
    }
  }

  function fireChildAdded (snap)
  {
    var ref = snap.ref();
    var note = osftools.cloneNote(snap.val(), false);
    var id = snap.name();
    var parentRef = snap.ref().parent().parent();
    var isRoot = (parentRef.child("notes").toString() == this.notesRef.toString());
    var parentId = (isRoot ? "_root" : parentRef.name());

    idRefMap[id] = ref;

    console.log("Child added. Parent:", parentId, ", ID:", id, ", NOTE:", note);
    this.trigger("noteAdded", id, note, parentId);

    ref.child('notes').on('child_added', fireChildAdded, this);
    ref.child('notes').on('child_removed', fireChildRemoved, this);

    var noteAttrs = ["time", "text", "link", "tags"];

    for (var i = 0; i < noteAttrs.length; i++)
    {
      var attr = noteAttrs[i];

      ref.child(attr).on('value',
        function (snap)
        {
          if(snap.val() === null)
            return; // note got deleted

          this.getNote(id,
            function (err, note)
            {
              this.trigger('noteEdited', id, note, [attr]);
            }.bind(this)
          );
        },
        this
      );
    }
  }

  function fireChildRemoved (snap)
  {
    var id = snap.name();
    var note = osftools.cloneNote(snap.val(), false);

    this.trigger('noteRemoved', id, note);
    delete idRefMap[id];
  }

  self.addNote = function (note, parent, cb)
  {
    if(parent instanceof Function)
    {
      cb = parent;
      parent = "_root";
    }

    note = osftools.cloneNote(note, false);

    var parentRef = idRefMap[parent];

    if(!parentRef)
      return cb("parent not found");

    var id = generateUuid();
    parentRef.child(id).set(note,
      function (err)
      {
        cb(err, !!err ? id : null);
      }
    );
  };

  self.removeNote = function (id, cb)
  {
    var noteRef = idRefMap[id];

    if(!noteRef)
      return cb("not found");

    noteRef.remove(cb);
  };

  self.editNote = function (id, newNote, cb)
  {
    this.getNote(id,
      function (err, oldNote)
      {
        if(err)
          return cb(err);

        newNote = osftools.cloneNote(newNote, false);
        var changed = osftools.diffNotes(oldNote, newNote);
        var noteRef = idRefMap[id];

        async.eachSeries(changed,
          function (change, cb)
          {
            noteRef.child(change).set(newNote[change], cb);
          },
          cb
        );
      }
    );
  };

  self.getNotes = function (cb)
  {
    cb(null);
  };

  self.getNote = function (id, cb)
  {
    var noteRef = idRefMap[id];

    if(!noteRef)
      return cb("not found");

    noteRef.once('value',
      function (snap)
      {
        var note = osftools.cloneNote(snap.val(), false);
        cb(null, note);
      }
    );
  };

  self.getFriendlyJson = function (note)
  {
    var notes = [];

    for (var id in note.notes)
    {
      var snote = note.notes[id];
      var fnote =
      {
        time: snote.time,
        text: snote.text,
        link: snote.link,
        tags: snote.tags,
        notes: this.getFriendlyJson(snote)
      };

      notes.push(fnote);
    }

    return notes;
  };

  self.doLoad = function (cb)
  {
    cb();
  };

  // http://www.broofa.com/Tools/Math.uuid.js, MIT
  function generateUuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,
      function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
      }
    );
  }

  shownoteseditor.connectors.firebase.prototype = self;
  MicroEvent.mixin(shownoteseditor.connectors.firebase);

  shownoteseditor.connectors.firebase.login = function (options, cb)
  {
    getUserRef(options, cb);
  };

  shownoteseditor.connectors.firebase.listDocuments = function (options, cb)
  {
    getUserRef (options,
      function (err, userRef)
      {
        if(err)
          return cb(err);

        var docsRef = userRef.child('docs');
        docsRef.once('value',
          function (snap)
          {
            var docs = [];
            var val = snap.val();

            if(val != null) // null => new user
            {
              var ids = Object.keys(val);

              for (var i = 0; i < ids.length; i++)
              {
                var id = ids[i];
                docs.push(
                  {
                    id: id,
                    name: val[id].name
                  }
                );
              }
            }

            cb(null, docs);
          }
        );
      }
    );
  };

  shownoteseditor.connectors.firebase.getDocument = function (options, docname, cb)
  {
    cb(null, []);
  };

  shownoteseditor.connectors.firebase.createDocument = function (options, doc, cb)
  {
    getUserRef (options,
      function (err, userRef)
      {
        if(err)
          return cb(err);

        var id = generateUuid();
        var docRef = userRef.child('docs/' + id);
        docRef.set(doc,
          function (err)
          {
            if(err)
            {
              cb(err);
            }
            else
            {
              doc.id = id;
              cb(null, doc);
            }
          }
        );
      }
    );
  };

  shownoteseditor.connectors.firebase.deleteDocument = function (options, docname, cb)
  {
    cb(null);
  };

  shownoteseditor.connectors.firebase.changeDocument = function (options, docname, newDoc, cb)
  {
    cb(null);
  };

  shownoteseditor.connectors.firebase.registration = {
    needsRegistration: true,
    registerFields: [ "email", "password" ],
    loginFields: [ "email", "password" ]
  };
})();

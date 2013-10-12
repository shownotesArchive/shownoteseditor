(function ()
{
  var self = {};
  var idRefMap = {};

  shownoteseditor.connectors.firebase = function (options, cb)
  {
    console.log("firebase init", options);

    getDocRef(options, options.docid,
      function (err, docRef)
      {
        if(err)
          return cb(err);

        this.docRef = docRef;
        this.notesRef = this.docRef.child('notes');
        this.notesRef.on('child_added', fireChildAdded, this);
        this.notesRef.on('child_removed', fireChildRemoved, this);

        idRefMap["_root"] = this.docRef; // idRefMap points to a *note*, or to things that have a .child('notes')

        cb();
      }.bind(this)
    );
  };

  function getUserRef (options, cb)
  {
    var rootRef = new Firebase('https://sne.firebaseIO.com/');
    var callLogin = false;
    var authValid = true;

    if(!options.auth ||
       options.auth.provider == "password" &&
       typeof options.auth.email != "string" &&
       typeof options.auth.password  != "string")
    {
      authValid = false;
    }

    var auth = new FirebaseSimpleLogin(rootRef,
      function(error, user)
      {
        if (error) {
          cb(error);
        } else if (user) {
          var userRef = rootRef.child('users/' + user.id + '/');
          cb(null, userRef, user.id);
        } else if(!callLogin && authValid) {
          callLogin = true;
        } else {
          cb("Not logged in");
        }
      }
    );

    if(callLogin)
    {
      options.auth.rememberMe = true;
      auth.login(options.auth.provider, options.auth);
    }
  }

  function getDocRef (options, docid, cb)
  {
    getUserRef (options,
      function (err, userRef)
      {
        if(err)
          return cb(err);

        var docRef = userRef.child('docs/' + docid);
        cb(null, docRef);
      }
    );
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
    parentRef.child("notes/" + id).set(note,
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

  self.getFriendlyJson = function (cb)
  {
    this.notesRef.once('value',
      function (snap)
      {
        var val = snap.val();
        var notes = [];
        if(val != null)
        {
          notes = getFriendlyJson({ notes: val });
        }
        osftools.sortNotes(notes);
        cb(null, notes);
      }
    );
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

  shownoteseditor.connectors.firebase.register = function (fields, cb)
  {
    var rootRef = new Firebase('https://sne.firebaseIO.com/');
    var auth = new FirebaseSimpleLogin(rootRef, function(error, user) {});
    auth.createUser(fields.email, fields.password, cb);
  };

  shownoteseditor.connectors.firebase.logout = function (cb)
  {
    var rootRef = new Firebase('https://sne.firebaseIO.com/');
    var auth = new FirebaseSimpleLogin(rootRef, function(error, user) {});
    auth.logout();
    cb();
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
                    name: val[id].name,
                    urls: val[id].urls
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

  shownoteseditor.connectors.firebase.getDocument = function (options, docid, cb)
  {
    getUserRef (options,
      function (err, userRef)
      {
        if(err)
          return cb(err);

        var notesRef = userRef.child('docs/' + docid + '/notes');
        notesRef.once('value',
          function (snap)
          {
            var val = snap.val();
            var notes = [];
            if(val != null)
            {
              notes = getFriendlyJson({ notes: val });
            }
            cb(null, notes);
          }
        );
      }
    );
  };

  shownoteseditor.connectors.firebase.createDocument = function (options, doc, cb)
  {
    var id = generateUuid();

    getDocRef (options, id,
      function (err, docRef)
      {
        if(err)
          return cb(err);

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

  shownoteseditor.connectors.firebase.deleteDocument = function (options, docid, cb)
  {
    getDocRef (options, docid,
      function (err, docRef)
      {
        if(err)
          return cb(err);
        docRef.remove(cb);
      }
    );
  };

  shownoteseditor.connectors.firebase.changeDocument = function (options, docid, newDoc, cb)
  {
    getDocRef (options, docid,
      function (err, docRef)
      {
        if(err)
          return cb(err);

        var children = [ 'name', 'urls' ];

        async.eachSeries(
          children,
          function (child, cb)
          {
            docRef.child(child).set(newDoc[child], cb);
          },
          cb
        );
      }
    );
  };

  function getFriendlyJson(note)
  {
    var notes = [];

    for (var id in note.notes)
    {
      var snote = note.notes[id];
      var fnote = osftools.cloneNote(snote, false);
      fnote.notes = getFriendlyJson(snote);
      notes.push(fnote);
    }

    return notes;
  };

  shownoteseditor.connectors.firebase.registration = {
    needsRegistration: true,
    registerFields: [ "email", "password" ],
    loginFields: [ "email", "password" ]
  };
})();

(function ()
{
  var self = {};
  var idRefMap = {};

  var rootRef = new Firebase('https://sne.firebaseIO.com/');

  shownoteseditor.connectors.firebase = function (options, cb)
  {
    console.log("firebase init", options);

    this.docRef = new Firebase(options.docid);
    this.notesRef = this.docRef.child('content/notes');
    setTimeout(
      function ()
      {
        this.notesRef.on('child_added', fireChildAdded, this);
        this.notesRef.on('child_removed', fireChildRemoved, this);
      }.bind(this),
      250
    );

    idRefMap["_root"] = this.docRef.child('content'); // idRefMap points to a *note*, or to things that have a .child('notes')

    doLogin (options,
      function (err, uid, userRef)
      {
        this.uid = uid;
        cb();
      }.bind(this)
    );
  };

  function doLogin (options, cb)
  {
    var callbacks = 1;
    var authValid = true;

    if(!options.auth ||
       options.auth.provider == "password" &&
       typeof options.auth.email != "string" &&
       typeof options.auth.password  != "string")
    {
      authValid = false;
    }

    if(authValid)
      callbacks++;

    var auth = new FirebaseSimpleLogin(rootRef,
      function(error, user)
      {
        callbacks = callbacks - 1;
        if(callbacks == 0)
        {
          if (error)
          {
            cb(error);
          }
          else if (user)
          {
            var userRef = rootRef.child('users/' + user.id);
            var nameRef = rootRef.child('userinfo/' + user.id + '/name');
            nameRef.once('value',
              function (snap)
              {
                if(!snap.val())
                {
                  var name = null;
                  while (!name) name = prompt("Please enter your nickname", "");
                  nameRef.set(name);
                }

                cb(null, user.id, userRef);
              }
            );
          }
          else
          {
            cb("Not logged in");
          }
        }
      }
    );

    if(authValid)
    {
      options.auth.rememberMe = true;
      auth.login(options.auth.provider, options.auth);
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
    var ignoreFirst = [];

    // empty arrays don't trigger an .on('value') which is used below
    if(note.tags.length === 0)
      ignoreFirst.push("tags");

    for (var i = 0; i < noteAttrs.length; i++)
    {
      var attr = noteAttrs[i];

      ref.child(attr).on('value',
        function (snap)
        {
          if(snap.val() === null && snap.name() != "tags")
            return; // note got deleted
          if(ignoreFirst.indexOf(snap.name()) == -1)
          {
            ignoreFirst.push(snap.name());
            return;
          }

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
    note.editors = {};
    note.editors[this.uid] = { time: Firebase.ServerValue.TIMESTAMP };

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

  self.clearNotes = function (cb)
  {
    this.notesRef.remove(cb);
  };

  self.editNote = function (id, newNote, cb)
  {
    var uid = this.uid;

    this.getNote(id,
      function (err, oldNote)
      {
        if(err)
          return cb(err);

        newNote = osftools.cloneNote(newNote, false);
        var changed = osftools.diffNotes(oldNote, newNote);
        var noteRef = idRefMap[id];

        async.series(
          [
            function (cb)
            {
              noteRef.child("editors").child(uid).set({ time: Firebase.ServerValue.TIMESTAMP }, cb);
            },
            function (cb)
            {
              async.eachSeries(changed,
                function (change, cb)
                {
                  noteRef.child(change).set(newNote[change], cb);
                },
                cb
              );
            }
          ],
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
        var val = snap.val() || {};
        var notes = getFriendlyJson({ notes: val });
        osftools.sortNotes(notes);
        cb(null, notes);
      }
    );
  };

  self.doLoad = function (cb)
  {
    cb();
  };

  self.setCustom = function (key, value, cb)
  {
    this.docRef.child('custom').child(key).set(value, cb);
  };

  self.getCustom = function (key, cb)
  {
    this.docRef.child('custom').child(key).once('value',
      function (snap)
      {
        var val = snap.val();
        cb(null, val);
      }
    );
  };

  self.bindCustom = function (key, func)
  {
    this.docRef.child('custom').child(key).on('value',
      function (snap)
      {
        var val = snap.val();
        func(key, val);
      }
    );
  };

  self.getServerTimeOffset = function (cb)
  {
    rootRef.child(".info/serverTimeOffset").on("value", function(snap)
      {
        var offset = snap.val();
        cb(null, offset);
      }
    );
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
    doLogin (options, cb);
  };

  shownoteseditor.connectors.firebase.register = function (fields, cb)
  {
    var auth = new FirebaseSimpleLogin(rootRef, function(error, user) {});
    auth.createUser(fields.email, fields.password, cb);
  };

  shownoteseditor.connectors.firebase.logout = function (cb)
  {
    var auth = new FirebaseSimpleLogin(rootRef, function(error, user) {});
    auth.logout();
    cb();
  };

  shownoteseditor.connectors.firebase.changePW = function (cb)
  {
    var auth = new FirebaseSimpleLogin(rootRef, function(error, user) {
      var oldpw = prompt("Enter your *old* password:");
      var newpw = prompt("Enter your *new* password:");
      auth.changePassword(user.email, oldpw, newpw, function(error, success) {
        if (!error) {
          alert("success!");
        }
      });
      cb();
    });
  };

  shownoteseditor.connectors.firebase.listDocuments = function (options, cb)
  {
    doLogin (options,
      function (err, uid, userRef)
      {
        if(err)
          return cb(err);

        var refs = [];
        var docs = [];

        async.parallel(
          [
            function (cb)
            {
              var docsRef = userRef.child('docs');

              docsRef.once('value',
                function (snap)
                {
                  snap.forEach(
                    function (csnap)
                    {
                      refs.push({
                        owner: uid,
                        ref: csnap.ref()
                      });
                    }
                  );

                  cb();
                }
              );
            },
            function (cb)
            {
              var sharedDocsRef = userRef.child('meta/sharedDocs');

              sharedDocsRef.once('value',
                function (snap)
                {
                  var val = snap.val() || [];

                  for (var i = 0; i < val.length; i++)
                  {
                    refs.push({
                      owner: val[i].user,
                      ref: rootRef.child("users/" + val[i].user + "/docs/" + val[i].doc)
                    });
                  }

                  cb();
                }
              );
            }
          ],
          function ()
          {
            async.each(refs,
              function (ref, cb)
              {
                ref.ref.once('value',
                  function (snap)
                  {
                    var id = ref.ref.toString();
                    var doc = snap.val();

                    doc.access.users = doc.access.users || {};
                    doc.owner = ref.owner;
                    doc.id = id;

                    docs.push(doc);

                    cb();
                  }
                );
              },
              function ()
              {
                cb(null, docs);
              }
            );
          }
        );
      }
    );
  };

  shownoteseditor.connectors.firebase.getDocument = function (options, docid, cb)
  {
    doLogin (options,
      function (err, uid, userRef)
      {
        if(err)
          return cb(err);

        var notesRef = new Firebase(docid).child('content/notes');
        notesRef.once('value',
          function (snap)
          {
            var val = snap.val() || {};
            var notes = getFriendlyJson({ notes: val });
            cb(null, notes);
          }
        );
      }
    );
  };

  shownoteseditor.connectors.firebase.createDocument = function (options, doc, cb)
  {
    var id = generateUuid();

    doLogin (options,
      function (err, uid, userRef)
      {
        if(err)
          return cb(err);

        var docRef = rootRef.child("/users/" + uid + "/docs/" + id);

        docRef.set(doc,
          function (err)
          {
            if(err)
            {
              cb(err);
            }
            else
            {
              doc.id = docRef.toString();
              cb(null, doc);
            }
          }
        );
      }
    );
  };

  shownoteseditor.connectors.firebase.deleteDocument = function (options, docid, cb)
  {
    doLogin (options,
      function (err, uid, userRef)
      {
        if(err)
          return cb(err);

        new Firebase(docid).remove(cb);
      }
    );
  };

  shownoteseditor.connectors.firebase.changeDocument = function (options, docid, newDoc, cb)
  {
    doLogin (options,
      function (err, uid, userRef)
      {
        if(err)
          return cb(err);

        var docRef = new Firebase(docid);
        var keys = Object.keys(newDoc);

        async.eachSeries(
          keys,
          function (key, cb)
          {
            if(key == "content")
              return;

            docRef.child(key).set(newDoc[key], cb);
          },
          cb
        );
      }
    );
  };

  shownoteseditor.connectors.firebase.getUsernameMap = function (options, cb)
  {
    doLogin (options,
      function (err, uid, userRef)
      {
        if(err)
          return cb(err);

        var userinfoRef = rootRef.child("userinfo");

        userinfoRef.once('value',
          function (snap)
          {
            var val = snap.val() || {};
            cb(null, val);
          }
        );
      }
    );
  };

  function getFriendlyJson(note, top)
  {
    var notes = [];

    for (var id in note.notes)
    {
      var snote = note.notes[id];
      var fnote = osftools.cloneNote(snote, false);
      fnote.notes = getFriendlyJson(snote, false);
      notes.push(fnote);
    }

    if(top !== false)
      osftools.sortNotes(notes);

    return notes;
  }

  shownoteseditor.connectors.firebase.registration = {
    needsRegistration: true,
    registerFields: [ "email", "password" ],
    loginFields: [ "email", "password" ]
  };
})();

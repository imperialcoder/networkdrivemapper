var ServiceWrapper = 'ServiceWrapper';

enyo.kind({
  name: ServiceWrapper,
  kind: enyo.Component,
  components: [
    
    {kind: "DbService", dbKind: "com.nelsun.networkdrives:1", components: [
        {name: "makeBffsDbKind", method: "putKind", onSuccessOLD: "onSuccess"}         
    ]},
    
    {
      kind: enyo.DbService,
      dbKind: "com.nelsun.networkdrives:1",//"com.palm.note:1",
      components: [
        {name: 'find', method: 'find', onSuccess: 'onSuccess', onFailure: 'onFailure'},
        //{name: 'register', method: 'putKind', onSuccess: 'onSuccess', onFailure: 'onFailure'},
        {name: 'search', method: 'search', onSuccess: 'onSuccess', onFailure: 'onFailure'},
        {name: 'merge', method: 'merge', onSuccess: 'onSuccess', onFailure: 'onFailure'},
        {name: 'put', method: 'put', onSuccess: 'onSuccess', onFailure: 'onFailure'},
        {name: 'del', method: 'del', onSuccess: 'onSuccess', onFailure: 'onFailure'},
        {name: 'delAll', method: 'delByQuery', onSuccess: 'onSuccess', onFailure: 'onFailure'}
      ]
    },
    {
      kind: enyo.PalmService,
      service: 'luna://com.palm.applicationManager/',
      components: [
        {name: 'launch', method: 'open', onSuccess: 'onSuccess', onFailure: 'onFailure'}
      ]
    }
  ],
  //create: function(){
  //  enyo.log("Servicewrapper: create: ");
  //  
  //},
  //rendered: function(){
  //  this.inherited(arguments);
  //  
  //},
  putDBKind: function(callbacks) {
    //this.saveCallbacks(callbacks);
    
        var indexes = [
          {
            "name":"name",
            props:[
              {
                "name": "name"
              }
            ]
          }
        ];
        this.$.makeBffsDbKind.call({owner: enyo.fetchAppId(), indexes:indexes}); // Create db8 kind
    
    //this.$.register.call({
    //  dbKind: "com.nelsun.networkdrives:1"
    //});
  },

  find: function(callbacks) {
    this.saveCallbacks(callbacks);
    
    this.putDBKind();
    //return
    this.$.find.call({
      query: {
        orderBy: "name"
      }
    });
  },

  search: function(filter, callbacks) {
    this.saveCallbacks(callbacks);
    this.$.search.call({
      query: {
        from: "com.nelsun.networkdrives:1",
        where: [{
            prop: "text",
            op: "?",
            val: filter,
            collate: "primary",
            tokenize: "all"
          }],
          orderBy: "name"
      }
    });
  },

  save: function(profile, callbacks) {
    this.saveCallbacks(callbacks);
    var profileJson = profile.serialize();
    var method = profileJson._id ? 'merge' : 'put';
    //this.log("profileJson", profileJson)
    //this.log("method", method)
    this.$[method].call({
      objects: [profileJson]
    });
  },

  del: function(profile, callbacks) {
    this.saveCallbacks(callbacks);
    var profileJson = profile.serialize();
    this.$.del.call({
      ids: [profileJson._id]
    });
  },

  delAll: function(callbacks) {
    this.saveCallbacks(callbacks);
    this.$.delAll.call();
  },

  launch: function(memoHtml, callbacks) {
    this.saveCallbacks(callbacks);
    this.$.launch.call({
      id: 'com.palm.app.email',
      params: {
        summary: $L("Just a quick memo"),
        text: memoHtml
      }
    });
  },

  saveCallbacks:function (callbacks) {
    this.onSuccess = callbacks.onSuccess;
    this.onFailure = util.wrap(callbacks.onFailure || function() {}, this.failure);
  },

  failure: function(originalOnFailure, request, response, xhr) {
    if (logApiFailures) {
      console.error("==> FAILED Luna Request");
      console.error("=============>", arguments);
//      console.error("==> request: ", JSON.stringify(request));
//      console.error("==> response: ", JSON.stringify(response));
      for (var key in response) {
        console.error("- " + key + ': ' + response[key]);
      }
      console.error("=============> XHR");
      for (key in xhr) {
        console.error("- " + key + ': ' + response[key]);
      }
    }
    originalOnFailure(request, response, xhr);
  }
});

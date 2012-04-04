function DbApi() {
  var self = this;

  self.getData = function(filter, callbacks) {
    var dbService = new ServiceWrapper();
    //var newCallbacks = {onSuccess: escapeHtml, onFailure: callbacks.onFailure};
    
    filter = filter ? filter : "";
    
    if (filter.length > 0) {
      dbService.search(filter, callbacks);
    } else {
      dbService.find(callbacks);
    }
  };

  self.saveProfile = function(profile, callbacks) {
    
    profile._kind = profile._kind ? profile._kind : "com.nelsun.networkdrives:1";
    
    var dbService = new ServiceWrapper();
    var newCallbacks = {onSuccess: updateProfile, onFailure: callbacks.onFailure};
    dbService.save(profile, newCallbacks);

    function updateProfile(request, response, xhr) {
      var result = response.results[0];
      profile.updateRev(result.rev);
      if (!profile.id) {
        profile.id = result.id;
      }
      callbacks.onSuccess(request, response, xhr);
    }
  };

  self.deleteProfile = function(profile, callbacks) {
    var dbService = new ServiceWrapper();
    var newCallbacks = {onSuccess: updateProfile, onFailure: callbacks && callbacks.onFailure ? callbacks.onFailure : undefined};

    dbService.del(profile, newCallbacks);

    function updateProfile(request, response, xhr) {
      profile.clear();
      
      if(callbacks.onSuccess){
        callbacks.onSuccess(request, response, xhr);
      }
      
    }
  };

  return self;
}
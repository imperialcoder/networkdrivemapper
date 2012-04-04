enyo.kind({
    name: "MainProfileListView",
    kind: enyo.VFlexBox,
    className: "enyo-bg",
    events: {
        onAddProfile: "",
        onEditProfile: "",
        onRefresh: ""
    },
    published: {
        activeProfile: undefined
    },
    components: [
    //{
    //    kind: "ApplicationEvents",
    //    onBack: "handleBack"
    //},
    {
        kind: "Scroller",
        flex: 1,
        components: [{
            kind: "VFlexBox",
            className: "box-center",
            components: [
            {
                kind: "RowGroup",
                name: "profileList",
                caption: $L("Network Drive Profiles"),
                components: [
                {
                    kind: "Item",
                    tapHighlight: false,
                    components: [{
                        kind: "HFlexBox",
                        components: [
                        {
                            content: $L("Loading drive profiles...")
                        }]
                    },
                    ]
                }]
            }]
        },
        ]
    },
    {
        kind: "Toolbar",
        name: "toolbarmain",
        pack: "center",
        name: "toolbar",
        components: [
        {kind: "Spacer"},
        {
            kind: "ToolButton",
            //caption: "New",
            name: 'newItem',
            icon: "images/icons/toolbar-icon-new.png",
            className: "enyo-light-menu-button",
            onclick: "handleNewItemClick"
        },
        {
            kind: "ToolButton",
            //caption: "Refresh",
            name: 'refreshList',
            icon: "images/icons/toolbar-icon-sync.png",
            className: "enyo-light-menu-button",
            onclick: "refresh"
        }
        ,{kind: "Spacer"}
        ]
    },
    {
        name: "drivemount",
        kind: 'PalmService',
        service: 'palm://com.nelsun.networkdrives.node/',
        method: 'drivemount',
        onSuccess: 'handleDriveMountResponse',
        onFailure: 'handleDriveMountResponse'
    },
    {
        name: "driveunmount",
        kind: 'PalmService',
        service: 'palm://com.nelsun.networkdrives.node/',
        method: 'driveunmount',
        onSuccess: 'handleDriveUnmountResponse',
        onFailure: 'handleDriveUnmountResponse'
    },
    {
        name: "drivelist",
        kind: 'PalmService',
        service: 'palm://com.nelsun.networkdrives.node/',
        method: 'drivelist',
        onSuccess: 'handleDriveListResponse',
        onFailure: 'handleDriveListResponse'
    },
    {
        name: "openApp",
        kind: "PalmService",
        service: "palm://com.palm.applicationManager",
        method: "open",
        onSuccess: "handleOpenApp",
        onFailure: "handleOpenApp",
        subscribe: false
    },
    {
        name: "dialogError",
        kind: "ErrorDialog"
    }
    ,
    {
        name: "passwordPrompt",
        kind: "passwordDialog",
        onAccept: "handlePasswordConfirmed",
        onCancel: "handlePasswordCancelled"
    }
    
    ],

    populateList: function(filterText) {
        enyo.log("populateList: ");
        var filter = filterText;

        app.dbApi.getData(filter, {
            onSuccess: enyo.bind(this, this.handleListItemsResponse),
            onFailure: enyo.bind(this, this.populateListFailure)
        });
    },
    populateListFailure: function() {
        this.log("");
        
        this.showError("Unable to load Network Drive profiles.");
    },
    getFixedMountPointPath: function(mountpoint){
        if(mountpoint.indexOf("/") != 0){
            mountpoint = "/" + mountpoint;
        }
        //check mountpoint has usb drive at begining.
        var mountroot = "/media/internal"
        if(mountpoint.indexOf(mountroot) < 0){
            mountpoint = mountroot + mountpoint;
        }
        
        return mountpoint;
    },
    handleListItemsResponse: function(request, response, xhr) {
        //enyo.log("ProfileListView: onSuccess: ");
        this.destroyProfileList();

        if (response.results) {
            
            var activeProfile = this.getActiveProfile();
            //this.log("-------------------activeProfile", activeProfile)
            
            for (var i = 0; i < response.results.length; i++) {
                var profile = new Profile(response.results[i]);
                
                profile.connecting = activeProfile ? (activeProfile.id == profile.id) : false;
                profile.connected = false;

                for (mp in this.existingMounts) {
                    //this.log("existing system mount point: ",this.existingMounts[mp])
                    
                    var profilemountpoint = this.getFixedMountPointPath(profile.mountpoint).toLowerCase();
                    
                    if (this.existingMounts[mp].toLowerCase() == profilemountpoint) {
                        profile.connected = true;
                    }
                }
                this.addProfileItemToList(profile);
            }
        }

        this.appendAddProfile();

        this.renderProfileList();
        
    },

    create: function() {
        this.inherited(arguments);
        this.refresh();
    },
    showError: function(errorMsg) {
        this.$.dialogError.openAtCenter($L("Connection Error"), errorMsg, "");
    },
    //handleBack: function(inSender, inEvent) {
    //    this.showError("handleBack: ");
    //    inEvent.preventDefault();
    //},
    removeProfile: function(profile) {
        this.log("Deleting profile - " + profile.name);
        app.dbApi.deleteProfile(profile);
    },

    handleSwipeDeleteProfileItem: function(inSender, inIndex) {
        this.log("Called: ", inSender.data);
        this.removeProfile(inSender.data);
        inSender.destroy();
    },
    appendAddProfile: function() {
        var compItem = this.$.profileList.createComponent({
            kind: "Item",
            tapHighlight: true,
            onclick: "doAddProfile",
            owner: this
        });
        var compHFlexBox = compItem.createComponent({
            kind: "HFlexBox",
            owner: this
        });
        compHFlexBox.createComponent({
            kind: "Image",
            src: "images/list-icon-add-item.png",
            style: "padding: 4px; padding-right: 10px;",
            owner: this
        });
        compHFlexBox.createComponent({
            content: $L("Add profile..."),
            owner: this
        });

    },
    blockInput: function() {
        enyo.scrim.show();
    },
    unblockInput: function() {
        enyo.scrim.hide();
    },

    addProfileItemToList: function(profile) {
        this.$.profileList.createComponent({
            kind: "ProfileItem",
            data: profile,
            onConfirm: "handleSwipeDeleteProfileItem",
            onTapProfileItem: "handleTapProfileItem",
            onTapProfileDetails: "handleTapProfileDetails",
            owner: this
        });
    },

    destroyProfileList: function() {
        this.$.profileList.destroyControls();
    },

    renderProfileList: function() {
        this.$.profileList.render();
    },
    
    
handlePasswordConfirmed: function(inSender, inProfile){
    //Create a copy of the profile and set the profile password
    var profile = enyo.clone(this.$.passwordPrompt.data);
    profile.password = inSender.getPassword();
    
    //Attempt connection to the profile.
    this.connectDisconnectProfile(profile);
},
handlePasswordCancelled: function(inSender){
    this.log();
},
    
    connectDisconnectProfile: function(profile) {
        this.log("setActiveProfile: ", profile)
        this.setActiveProfile(profile);
        
        if (profile.connected == true) {
            this.log("connected: calling for dismount: ");
            var clonedprofile = enyo.clone(profile);
            clonedprofile.mountpoint = this.getFixedMountPointPath(clonedprofile.mountpoint);
            this.log(profile.mountpoint,clonedprofile.mountpoint)
            
            this.blockInput();
            
            this.$.driveunmount.call(clonedprofile);
        } else {
            this.log("connecting: ");
            
            if(profile.username && profile.username.length > 0 && profile.password.length == 0){
                //Prompt for passsrod if user name present in profile
                setTimeout(enyo.bind(this,function(){
                    this.$.passwordPrompt.openPopup(profile, "Password Prompt", 'Please enter password for user "' + profile.username + '" to access "' + profile.address + '"');
                }),500)
                
                return;
            }
            
            this.blockInput();
            this.$.drivemount.call(profile);
        }

        this.log("request sent:");
        this.refresh();
    },

    handleTapProfileItem: function(inSender, profileItem) {
        
        this.log("Called: ", profileItem);
        
        this.connectDisconnectProfile(profileItem);
    },

    handleTapProfileDetails: function(inSender, profileItem) {
        this.log("profileItem: ", profileItem);
        this.doEditProfile(profileItem);
    },

    handleNewItemClick: function(inSender, profileItem) {
        this.doEditProfile();
    },
    refresh: function() {
        this.log("refesh called:");
        this.$.drivelist.call();
    },

    handleDriveMountResponse: function(inSender, inResponse, inRequest) {

        this.unblockInput();

        if (undefined != inResponse) {
            this.log("Response Received: ", inResponse);
            
            var activeProfile = this.getActiveProfile();
            if(activeProfile && inResponse.params && activeProfile.id == inResponse.params.id){
                this.setActiveProfile(undefined);
            }
            
            if (!inResponse.errorCode && !inResponse.errorText) {
                //Launch app to mounted path?
                
                //this.$.openApp.call(
                //    {
                //        "id": "ca.canucksoftware.internalz",
                //        "params": {
                //            path:inResponse.params.mountpoint
                //        }
                //    }
                //)
                
            } else {
                if(inResponse.params && inResponse.params.errors){
                    var errors = inResponse.params.errors;
                    for(var i = 0; i < errors.length; i++){
                        var error = errors[i];
                        var errorText = error.errorText
                        switch(parseInt(error.errorCode)){
                            case 112://Host is down
                                errorText += ": the computer hosting the network drive is unavailable.Best check it is switched on and that its network sharing service is running correctly."
                                break;
                            
                            case 110://Connection timed out
                                errorText += ": the computer hosting the network drive could not be reached."
                                break;
                            
                            case 13://Permission denied
                                errorText += ": please check any user name, password and domain for the profile and try again."
                                break;
                            
                            case 12://Cannot allocate memory
                                /*
                                 Likely cause is trying to mount a windows share
                                 and the host box has run out of non paged pool
                                 memory.
                                 See http://linux.derkeiler.com/Newsgroups/comp.os.linux.networking/2006-10/msg00629.html
                                */
                                errorText += ": if you are trying to mount a Windows share you may be able to fix the problem by <a href='http://linux.derkeiler.com/Newsgroups/comp.os.linux.networking/2006-10/msg00629.html'>following the instructions here</a>."
                                break;
                            
                            case 6://No such device or address
                                errorText += ": please check the profile drive path and try again."
                                break;
                            
                            default:
                                
                        }
                        
                        this.showError(errorText);
                    }
                }else{
                    this.showError(inResponse.errorText.split("\n")[0]);
                }
                
            }
        } else {
            this.error("Invalid connect response received");
        }
        
        this.refresh();
    },
    
    
    handleDonateClick: function(inSender) {
        var url = "https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=H52LZT4RHA278";
        this.log();
        
        this.$.openApp.call(
            {
                "target": url
            }
        )
        
    },
    handleDriveUnmountResponse: function(inSender, inResponse, inRequest) {

        this.unblockInput();

        if (undefined != inResponse) {
            this.log("Response Received: ", inResponse);
            if (!inResponse.errorCode && !inResponse.errorText) {

            } else {
                this.showError(inResponse.errorText);
            }
        } else {
            this.error("Invalid connect response received");
        }
        
        this.setActiveProfile(undefined);
        
        this.refresh();
    },
    handleDriveListResponse: function(inSender, inResponse, inRequest) {

        if (undefined != inResponse) {
            this.log("Response Received: ", inResponse);
            this.existingMounts = [];
            if (inResponse.errorText) {
                this.showError(inResponse.errorText);
            }else if(inResponse.returnValue == true && inResponse.mounts){
                for(var i = 0; i < inResponse.mounts.length; i++){
                    this.existingMounts[i] = inResponse.mounts[i].mountpoint;
                }
                //this.existingMounts = this.existingMounts.concat(inResponse.mounts)
            }
        } else {
            this.error("Invalid connect response received");
        }

        this.populateList();
    }

});
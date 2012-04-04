enyo.kind({
    name: "ProfileDialog",
    kind: enyo.VFlexBox,
    className: "enyo-bg",
    events: {
        onSaved: "",
        onCanceled: ""
    },
    published: {
        profile: {}
    },
    components: [
    {
        kind: "Scroller",
        flex: 1,
        components: [{
            kind: "VFlexBox",
            className: "box-center",
            components: [
                {
                    kind: "RowGroup",
                    caption: "Display Name *",
                    components: [{
                        kind: "Input",
                        name: "name",
                        //label: "",
                        hint: "Enter profile name",
                        onchange: "inputChange"
                    }]
                },
                {
                    kind: "RowGroup",
                    caption: "Drive Path *",
                    components: [{
                        kind: "Input",
                        name: "address",
                        autoWordComplete: false,
                        autoCapitalize: "lowercase",
                        spellcheck: false,
                        autocorrect: false,
                        //label: "",
                        hint: "Enter share path e.g. 10.0.0.2/share",
                        onchange: "inputChange"
                    }]
                },
                {
                    kind: "RowGroup",
                    caption: "Mount to Folder *",
                    components: [{
                        kind: "Input",
                        name: "mountpoint",
                        autoWordComplete: false,
                        autoCapitalize: "lowercase",
                        spellcheck: false,
                        autocorrect: false,
                        label: "",
                        hint: "Enter path to folder e.g. shares/somefolder",
                        onchange: "inputChange"
                    }]
                },
                {
                    kind: "RowGroup",
                    caption: "User Name",
                    components: [{
                        kind: "Input",
                        name: "username",
                        autoWordComplete: false,
                        autoCapitalize: "lowercase",
                        spellcheck: false,
                        autocorrect: false,
                        //label: "",
                        hint: "Enter user name",
                        onchange: "inputChange"
                    }]
                },
                {
                    kind: "RowGroup",
                    caption: "Password (leave blank for prompt)",
                    components: [{
                        kind: "PasswordInput",
                        name: "password",
                        autoWordComplete: false,
                        autoCapitalize: "lowercase",
                        spellcheck: false,
                        autocorrect: false,
                        //label: "",
                        hint: "Enter user password",
                        onchange: "inputChange"
                    }]
                },
                {
                    kind: "RowGroup",
                    caption: "Domain",
                    components: [{
                        kind: "Input",
                        name: "domain",
                        autoWordComplete: false,
                        autoCapitalize: "lowercase",
                        spellcheck: false,
                        autocorrect: false,
                        //label: "",
                        hint: "Enter user domain",
                        onchange: "inputChange"
                    }]
                }
                ,{
                    kind: "RowGroup",
                    caption: "Read mode",
                    components: [
                        {kind: "ListSelector", name: "readmode", items: [
                            {caption: "Read-write", value: 'rw'},
                            {caption: "Read-only", value: 'ro'}
                        ]}                        
                    ]
                }
                ,{
                    kind: "RowGroup",
                    caption: "Read Speed",
                    components: [
                        {kind: "ListSelector", name: "rsize",items: [
                            {caption: "Default", value: ''},
                            {caption: "32K", value: '32768'},
                            {caption: "48K", value: '49152'},
                            {caption: "64K", value: '65536'},
                            {caption: "96K", value: '98304'},
                            {caption: "128K", value: '131072'}
                        ]}                        
                    ]
                }
                ,{
                    kind: "RowGroup",
                    caption: "Write speed",
                    components: [
                        {kind: "ListSelector", name: "wsize", items: [
                            {caption: "Default", value: ''},
                            {caption: "32K", value: '32768'},
                            {caption: "48K", value: '49152'},
                            {caption: "64K", value: '65536'},
                            {caption: "96K", value: '98304'},
                            {caption: "128K", value: '131072'}
                        ]}                        
                    ]
                }
            ]
        },
        ]
    },
    {
        kind: "Toolbar",
        className: "enyo-toolbar-light",
        pack: "center",
        components: [{
            name: "acceptButton",
            caption: $L("Save"),
            kind: "Button",
            className: "enyo-preference-button enyo-button-affirmative",
            onclick: "acceptClick"
        },
        {
            name: "cancelButton",
            caption: $L("Cancel"),
            kind: "Button",
            className: "enyo-preference-button enyo-button-negative",
            onclick: "cancelClick"
        }]
    },
    {
        name: "dialogError",
        kind: "ErrorDialog",
        onClose:"dismissError"
    },
    {
        name: "createfolderprompt",
        kind: "AcceptCancelPopup",
        onAccept:"handleFolderCreate",
        acceptCaption:"Create folder",
        components: [
            {name: "title", width:"100%", style:"text-align: center; padding-bottom: 6px;", content:"Create Folder?" },
            {name: "message", className: "enyo-paragraph", content: "The mount to folder does not exist." },
            
        ]
    },
    
    
    {
        name: "folderexists",
        kind: 'PalmService',
        service: 'palm://com.nelsun.networkdrives.node/',
        method: 'folderexists',
        onSuccess: 'handleFolderExistsResponse',
        onFailure: 'handleFolderExistsResponse'
    },
    {
        name: "foldercreate",
        kind: 'PalmService',
        service: 'palm://com.nelsun.networkdrives.node/',
        method: 'foldercreate',
        onSuccess: 'handleFolderCreateResponse',
        onFailure: 'handleFolderCreateResponse'
    },
    ],
    handleFolderCreate: function(){
        enyo.scrim.show();
        this.$.foldercreate.call(this.profile);
    },
    handleFolderCreateResponse: function(inSender, inResponse){
        this.error("inResponse:",inResponse);
        
        enyo.scrim.hide();
        
        if(inResponse.exists == true){
            //Folder created
            this.log(inResponse.mountpoint + " created!");
            enyo.windows.addBannerMessage("Folder " + inResponse.mountpoint + " " + $L("created!"), "{}");
            this.acceptClick();
        }else{
            this.showError("Unable to create folder '" + inResponse.params.mountpoint + "'" + (inResponse.errorText ? inResponse.errorText : ""));
        }
    },
    handleFolderExistsResponse: function(inSender, inResponse){
        this.error("inResponse:",inResponse);
        //this.log("inResponse: exception: ",inResponse.exception);
        if(inResponse.returnValue == true){
            if(inResponse.exists == true){
                //Folder exists
                this.mountpointexists = true;
                this.acceptClick();
            }else{
                this.mountpointexists = undefined;
                //this.showError("The mount to folder does not exist. Please check the path and try again.",enyo.bind(this,function(){this.$.mountpoint.forceFocus();}));
                this.$.createfolderprompt.openPopup();
            }
        }else{
            this.showError("Unable to verify the mount to folder exists. " + (inResponse.errorText ? inResponse.errorText : ""));
            this.mountpointexists = undefined;
        }
    },
    
    dismissError: function() {
        this.log("")
        if(this.onErrorDismiss){
            this.onErrorDismiss();
            this.onErrorDismiss = undefined;
        }
    },
    
    create: function() {
        this.inherited(arguments);
    },
    setActiveProfile: function(inProfile) {
        this.log("starting")
        //this.inherited(arguments);
        
        this.profile = inProfile ? inProfile : new Profile();
        this.log("setting values")
        this.$.name.setValue(this.profile.name);
        this.$.address.setValue(this.profile.address);
        this.$.mountpoint.setValue(this.profile.mountpoint);
        this.$.username.setValue(this.profile.username);
        this.$.password.setValue(this.profile.password);
        this.$.domain.setValue(this.profile.domain);
        this.$.rsize.setValue(this.profile.rsize);
        this.$.wsize.setValue(this.profile.wsize);
        this.$.readmode.setValue(this.profile.readmode);
        
        //this.$.name.setValue(this.profile.name);
        
        this.log("done.")

    },
    beginEdit: function() {
        this.log("")
        this.$.name.forceFocus();
    },
    showError: function(errorMsg, onDismiss) {
        this.onErrorDismiss = onDismiss;
        this.$.dialogError.openAtCenter($L("Profile Error"), errorMsg, "");
    },
    acceptClick: function() {

        this.profile.name = this.$.name.getValue().trim().replace(/"/gi,"");
        this.profile.address = this.$.address.getValue().trim().replace("//","").replace(/"/gi,"");
        this.profile.mountpoint = this.$.mountpoint.getValue().trim().replace(/"/gi,"");
        this.profile.username = this.$.username.getValue().trim();//.replace(/"/gi,"");
        this.profile.password = this.$.password.getValue().trim();//.replace(/"/gi,"");
        this.profile.domain = this.$.domain.getValue().trim();//.replace(/"/gi,"");
        this.profile.rsize = this.$.rsize.getValue().trim();
        this.profile.wsize = this.$.wsize.getValue().trim();
        this.profile.readmode = this.$.readmode.getValue().trim();
        
        this.setActiveProfile(this.profile);
        
        //Validate required inputs...
        
        //Validate name
        if(this.profile.name == ""){
            this.showError("Please enter the display name for this profile.",enyo.bind(this,function(){this.$.name.forceFocus();}));
            return
        }
        //Validate drive path
        if(this.profile.address == ""){
            this.showError("Please enter the drive path for this profile.",enyo.bind(this,function(){this.$.address.forceFocus();}));
            return
        }
        
        //check address has server and share name
        var addressparts = this.profile.address.split("/");
        if(addressparts.length != 2){
            this.showError("Drive path must be in the form of server/sharename e.g. 10.0.0.5/sharedstuff.",enyo.bind(this,function(){this.$.address.forceFocus();}));
            return
        }
        
        //Check for ip address
        var ip = addressparts[0];
        ipparts = ip.split(".");
        //this.log("iparts.length: ", ipparts.length)
        var isip = ipparts.length == 4;
        if(isip === true){
            for(var i = 0; i < ipparts.length; i++){
                //this.log("ipparts[" + i + "] = " + ipparts[i])
                if(isNaN(ipparts[i]) == true || ipparts[i] == ""){
                    isip = false;
                    break;
                }else if(parseInt(ipparts[i]) > 255 || parseInt(ipparts[i]) < 0){
                    isip = false;
                    break;
                }
                
            }
        }
        if(isip != true){
            //this.showError("Drive path must start with a valid ip address e.g. 10.0.0.5",enyo.bind(this,function(){this.$.address.forceFocus();}));
            //return
        }
        //Check for share name
        if(addressparts.length == 2 && addressparts[1] == ""){
            this.showError("Drive path must end with the share name e.g. sharedstuff",enyo.bind(this,function(){this.$.address.forceFocus();}));
            return
        }
        
        //Validate mount point
        if(this.profile.mountpoint == ""){
            this.showError("Please enter the path to the folder you wish to mount the drive under for this profile.",enyo.bind(this,function(){this.$.mountpoint.forceFocus();}));
            return
        }
        this.log("this.mountpointexists",this.mountpointexists)
        if (this.mountpointexists == undefined){
            this.$.folderexists.call(this.profile);
            return;
        }

        var data = {
            //id: 
            //,rev: 
            name: this.profile.name,
            address: this.profile.address,
            mountpoint: this.profile.mountpoint,
            username: this.profile.username,
            password: this.profile.password,
            domain: this.profile.domain,
            readmode: this.profile.readmode,
            wsize: this.profile.wsize,
            rsize: this.profile.rsize
        }
        //this.log("data", data)
        var profile = new Profile(data);
        profile.id = this.profile.id;
        profile.updateRev(this.profile.rev);

        var callbacks = {
            onSuccess: enyo.bind(this, this.doSaved)
        }
        app.dbApi.saveProfile(profile, callbacks);
        
        this.mountpointexists = undefined;
        
        //this.close();
    },
    cancelClick: function() {
        this.mountpointexists = undefined;
        this.doCanceled();
        //this.parent.close();
    }
});
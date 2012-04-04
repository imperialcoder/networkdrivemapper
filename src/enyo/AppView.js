var logApiFailures = true;

var AppView = "AppView";

enyo.kind({
    name: "AppView",
    kind: enyo.VFlexBox,
    //className: 'enyo-fit enyo-vflexbox main',
    className: "enyo-bg",
    published: {},
    components: [{
        kind: "ApplicationEvents",
        onApplicationRelaunch: "applicationRelaunchHandler"
	,onBack: "handleBack"
    },

    {
        kind: "Toolbar",
        name: "header",
        className: "enyo-toolbar-light",
        pack: "center",
        components: [{
            kind: "Image",
            src: "icon.png",
            height: "64px",
            style: "margin-right: 10px"
        },
        {
            kind: "Control",
            name: "title",
            content: $L("Network Drives"),
            className: "enyo-text-header page-title"
        }]
    },
    
    { kind: "Pane", flex: 1, onSelectView: "viewSelected", components: [
	{
	    kind: "MainProfileListView",
	    flex: 1,
	    name: "list",
	    onAddProfile: "newItemClick",
	    onEditProfile: "editItemClick"
	    //onShowConnectionDetails: "showConnectionDetailsView",
	    //onConnectFailure: "closeBannerPrompt",
	    //onForceShowMainView: "showMainView",
	    //onClearConnectionDetailsView: "clearConnectionDetailsView"
	},
	{
	    name: "dialogProfile",
	    kind: "ProfileDialog",
	    onCanceled: "handleProfileCanceled",
	    onSaved: "handleProfileSaved"
	}
    ]},
    
],
    
    handleBack: function(inSender, inEvent) {
        if(this.$.pane.getViewName().toLowerCase() !== "list"){
	    this.$.pane.back(inEvent);
	}
    },
    handleProfileSaved: function(inSender){
	this.log("");
	this.refeshItemClick();
	this.$.pane.selectViewByName(this.$.list.name);
    },
    handleProfileCanceled: function(inSender){
	this.log("");
	this.$.pane.selectViewByName(this.$.list.name);
    },
    
    viewSelected: function(inSender, inView, inPreviousView) {
        var title = "";
        switch (inView.name) {
            case "dialogProfile":
                title = $L("Edit Drive");
                break;
            case "list":
                title = $L("Network Drives");
                break;
        }
        this.$.title.setContent(title);
    },
    
    
    newItemClick: function(inSender) {
        console.log("newItemClick: ");
        this.$.dialogProfile.setActiveProfile();
	this.$.pane.selectViewByName("dialogProfile");
	this.$.dialogProfile.beginEdit();
    },
    refeshItemClick: function(inSender) {
        console.log("refeshItemClick: ");
        this.$.list.refresh();
    },
    editItemClick: function(inSender, inProfile) {
        this.log("editItemClick: ");
        this.$.dialogProfile.setActiveProfile(inProfile);
	this.$.pane.selectViewByName("dialogProfile");
	this.$.dialogProfile.beginEdit();
	this.log("done.");
    },
    applicationRelaunchHandler: function(params) {},
    create: function() {
        this.inherited(arguments);
        enyo.setAllowedOrientation('free');
    },
    rendered: function() {
        this.inherited(arguments);
        
    },
    //
    //listSuccess: function(inSender, inResponse) {
    //    //enyo.windows.getActiveWindow().close();
    //    console.log("listSuccess: ")
    //    console.log("listSuccess: inResponse: " + enyo.json.stringify(inResponse));
    //
    //    if (inResponse.returnValue === true) {
    //
    //        console.log("listSuccess: inResponse: " + enyo.json.stringify(inResponse));
    //    } else {
    //        //this.$.nodeShellElement.setContent("Error "+inResponse.errorCode+": "+inResponse.errorText);
    //    }
    //},
    //listFailure: function(inSender, inResponse) {
    //    //enyo.windows.getActiveWindow().close();
    //    console.log("listFailure: ")
    //    console.log("listFailure: inResponse: " + enyo.json.stringify(inResponse));
    //
    //    if (inResponse.returnValue === true) {
    //
    //        console.log("listSuccess: inResponse: " + enyo.json.stringify(inResponse));
    //    } else {
    //        //this.$.nodeShellElement.setContent("Error "+inResponse.errorCode+": "+inResponse.errorText);
    //    }
    //},
    //
    //addSuccess: function(inSender, inResponse) {
    //    //enyo.windows.getActiveWindow().close();
    //    console.log("addSuccess: ")
    //    if (inResponse.returnValue === true) {
    //
    //        console.log("addSuccess: inResponse: " + enyo.json.stringify(inResponse));
    //    } else {
    //        //this.$.nodeShellElement.setContent("Error "+inResponse.errorCode+": "+inResponse.errorText);
    //    }
    //},
    //addFailure: function(inSender, inResponse) {
    //    //enyo.windows.getActiveWindow().close();
    //    console.log("addFailure: ")
    //    if (inResponse.returnValue === true) {
    //        console.log("addFailure: inResponse: " + enyo.json.stringify(inResponse));
    //    } else {
    //        //this.$.nodeShellElement.setContent("Error "+inResponse.errorCode+": "+inResponse.errorText);
    //    }
    //},
    go: function() {
	
    }
});
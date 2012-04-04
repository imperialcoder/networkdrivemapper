//{name: "loginDialog", kind: "AcceptCancelPopup", onResponse: "loginResponse", onClose: "closeLogin", components: [
//        {name: "loginMessage", className: "browser-dialog-body enyo-text-body "},
//        {name: "userInput", kind: "Input", spellcheck: false, autocorrect: false, autoCapitalize: "lowercase", hint: $L("Username...")},
//        {name: "passwordInput", kind: "PasswordInput", hint: $L("Password...")}
//]},


enyo.kind({
    name: "passwordDialog",
    kind: "AcceptCancelPopup",
    //onAccept: "handleOK",
    //onClose: "handleCancel",
    events:{
        //onOK: "",
        //onCancel: ""
    },
    published: {
        title: "",
        message: ""
    },
    components: [
        //{content: "Enter password:"},
        { kind:"VFlexBox", components: [
            {name: "title", width:"100%", style:"text-align: center; padding-bottom: 6px;" },
            {name: "message", className: "enyo-paragraph", allowHtml: true },
            
            {name:"password", kind: "PasswordInput", hint: "Enter password", onkeypress: "handlePasswordKeyPress"},
            
        ]}
        
    ],
    handlePasswordKeyPress: function(inSender,event){
        //this.log(event.keyCode);
        
        if (event.keyCode == 13) {
            this.acceptClick();
        }
    },
    create: function() {
        this.inherited(arguments);
    },
    
    openPopup: function(inData,inTitle, inMessage) {
        this.log("")
        
        this.inherited(arguments);
        
        this.$.password.setValue("");
        this.data = inData;
        this.$.password.forceFocus();
        
        if (inTitle) {
            this.setTitle(inTitle);
        }
        if (inMessage) {
            this.setMessage(inMessage);
        }
        
        this.openAtCenter();
    },
    titleChanged: function() {
        this.$.title.setContent(this.title);
        this.$.title.setShowing(this.title);
    },

    messageChanged: function() {
        this.$.message.setContent(this.message.replace(/\n/g, '<br>'));
    },
    
    
    getPassword: function(){
        return this.$.password.getValue();
    },
    handleOK: function(inSender){
        this.log()
        this.doOK(this.data);
        //this.close();
    },
    handleCancel: function(inSender){
        this.log()
        this.doCancel();
        //this.close();
    }
})
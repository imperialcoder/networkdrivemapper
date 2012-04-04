


var DriveMountAssistant = function() {
};
DriveMountAssistant.prototype.run = function(future) {
    console.log("DriveMountAssistant.prototype.run: ")
    
    var args = this.controller.args;
    
    var address = args.address ? args.address : "";
    var mountpoint = args.mountpoint ? args.mountpoint : "";
    var username = args.username ? args.username : "";
    var userpassword = args.password ? args.password : "";
    var userdomain = args.domain ? args.domain : "";
    var rsize = args.rsize ? args.rsize : "";
    var wsize = args.wsize ? args.wsize : "";
    var readmode = args.readmode ? args.readmode : "rw";
    var id = args.id;
    
    address = address.replace("//","");
    //check for share name
    if(address.indexOf("/") < 0){
	future.result = {
	    errorCode: -1
	    ,errorText: "No share name provided."
	}
	return false;
    }
    //extract share name
    var addressparts = address.split("/");
    var sharename = addressparts[1];
    var server = addressparts[0];
    
    //Validate mountpoint
    if(mountpoint.length < 1){
	future.result = {
	    errorCode: -1
	    ,errorText: "No mount folder provided."
	}
	return false;
    }
    
    //check mountpoint starts with valid path delimeter
    if(mountpoint.indexOf("/") != 0){
	mountpoint = "/" + mountpoint;
    }
    //check mountpoint has usb drive at begining.
    var mountroot = "/media/internal"
    if(mountpoint.indexOf(mountroot) < 0){
	mountpoint = mountroot + mountpoint;
    }
    
    console.log("DriveMountAssistant.prototype.run: cmd :" + cmd);
    var params = {
	id: id
	,server: server
	,share: sharename
	,mountpoint: mountpoint
	,username: username
	,domain: userdomain
	,rsize:rsize
	,wsize:wsize
	,readmode:readmode
    }
    
    //Build command line for mount script...
    var cmd = "/bin/sh "
    //Path to script:
    cmd += "/media/cryptofs/apps/usr/palm/services/com.nelsun.networkdrives.node"
    cmd += "/scripts/drivemount.sh";
    //add script parameters:
    cmd += " \"" + params.server + "\"";//SERVER
    cmd += " \"" + params.share + "\"";//FOLDER
    cmd += " \"" + params.mountpoint + "\"";//MOUNTPOINT
    cmd += " \"" + params.username + "\"";//USERNAME
    cmd += " \"" + userpassword + "\"";//PASSWORD
    cmd += " \"" + params.domain + "\"";//DOMAIN
    cmd += " \"" + params.rsize + "\"";//rsize
    cmd += " \"" + params.wsize + "\"";//wsize
    cmd += " \"" + params.readmode + "\"";//readmode
    
    //Run the script
    var cmdLine = new CommandLine(cmd, params, future);
    cmdLine.run();
    
};



var DriveUnmountAssistant = function() {
};
DriveUnmountAssistant.prototype.run = function(future) {
    console.log("DriveUnmountAssistant.prototype.run: ")
    
    var args = this.controller.args;
    var mountpoint = args.mountpoint;
    var id = args.id;
    
    if(!mountpoint){
	future.result = {
	    errorCode: -1
	    ,errorText: "No share name provided to dismount."
	}
	return false;
	
    }
    //var cmd = "umount -f " + args.mountpoint;
    
    //Build command line for mount script...
    
    //Path to script:
    var cmd = "/bin/sh "
    cmd += "/media/cryptofs/apps/usr/palm/services/com.nelsun.networkdrives.node"
    cmd += "/scripts/driveunmount.sh";
    //Parameters:
    cmd += " \"" + mountpoint + "\"";
    
    console.log("DriveUnmountAssistant.prototype.run: cmd :" + cmd);
    var params = {
	id: id
	,mountpoint: mountpoint
    }
    var cmdLine = new CommandLine(cmd, params, future);
    cmdLine.run();
    
    
    //console.log("DriveUnmountAssistant.prototype.run: cmd :" + cmd);
    //var cmdLine = new CommandLine(cmd,future);
    //cmdLine.run();
};



var DriveListAssistant = function() {
};
DriveListAssistant.prototype.run = function(future) {
    console.log("DriveListAssistant.prototype.run: ")
    
    var cmd = 'grep "//" /etc/mtab';
    
    console.log("DriveListAssistant.prototype.run: cmd :" + cmd);
    var cmdLine = new CommandLine(cmd,undefined, future);
    var cmdCallback = function(inResponse){
	
	var params = inResponse.params ? inResponse.params : {};
	//params.yo = "dawg!"
	
	if (!inResponse.errorCode && inResponse.resultText) {
	    
	    var existingMounts = [];
	    
	    var drives = inResponse.resultText.split("\n");
	    //this.log(drives.length + " drives connected:");
	    //params.numMapped = drives.length;
	    //params.drives = [];
	    var result = {
		returnValue: true
		,mounts: []
		,params: params
	    }
	    
	    for (var i = 0; i < drives.length; i++) {
		//this.log("drive: " + i  + ": " + drives[i])
		
		//params.drives[i] = drives[i];
		
		if (drives[i].indexOf(" ") > -1) {
		    var driveparts = drives[i].split(" ");
		    var mountpoint = driveparts[1];
		    //Clean up special characters in path:
		    mountpoint = mountpoint.replace(/\\040/gi," ");//remove encoded spaces
		    
		    result.mounts[i] = {
			type: driveparts[2]
			,mountpoint: mountpoint
		    }
		    //mountpoint;
		    //var type = ;
		    ////this.log("Drive " + i + " type: " + type + ": mountpoint: " + mountpoint )
		    //existingMounts[existingMounts.length -1] = mountpoint;
		}
	    }
	    inResponse.future.result = result
	}else{
	    inResponse.future.result = {
		returnValue: false
		,errorCode: inResponse.errorCode
		,errorText: inResponse.errorText
		,params: params
	    }
	}
	
    }
    cmdLine.run(cmdCallback);
};
var path = IMPORTS.require("path");
var makeFullPath = function(path){
    /*
     Takes path and returns it ensuring it begins with /media/internal
    */
    var fullpath = path;
    var pathroot = "/media/internal";
    
    if(fullpath.indexOf("/") != 0){
	fullpath = "/" + fullpath;
    }
    if(fullpath.indexOf(pathroot) != 0){
	fullpath = pathroot + fullpath;
    }
    
    return fullpath;
}
var FolderExistsAssistant = function() {
};
FolderExistsAssistant.prototype.run = function(future) {
    console.log("FolderExistsAssistant.prototype.run: ")
    
    var error;
    var existsResult = false;
    
    try{
	
	var fullpath = makeFullPath(this.controller.args.mountpoint);
	path.exists(fullpath, function (exists) {
	    future.result = {
		returnValue: exists,
		exists: exists,
		mountpoint: fullpath
	    };
	});
	return;
	//if(existsResult == true){
	//    future.result = {
	//	returnValue: true,
	//	exists: existsResult,
	//	mountpoint: fullpath
	//    };
	//    return;
	//}
    }catch(err){
	error = err;
    }
    
    if(error){
	error.errorCode = error.errno;
	error.errorText = error.message;
    }else{
	error = {
	    errorCode: -1,
	    errorText: "Folder not found."
	}	
    }
    error.mountpoint = fullpath;
    
    future.result = {
	exists: false,
	exception: error
    };
    //return false;

};

var FolderCreateAssistant = function() {
};
FolderCreateAssistant.prototype.run = function(future) {
    console.log("FolderCreateAssistant.prototype.run: ")
    
    var fullpath = makeFullPath(this.controller.args.mountpoint)
    var cmd = 'mkdir -p ' + fullpath;
    var result = {
	mountpoint: fullpath
    }
    
    console.log("FolderCreateAssistant.prototype.run: cmd :" + cmd);
    var cmdLine = new CommandLine(cmd,result, future);
    var cmdCallback = function(inResponse){
	
	var fullpath = result.mountpoint;
	
	path.exists(fullpath, function (exists) {
	    inResponse.future.result = {
		returnValue: exists,
		exists: exists,
		mountpoint: fullpath
	    };
	});
    }
    cmdLine.run(cmdCallback);
    //cmdLine.run();
};
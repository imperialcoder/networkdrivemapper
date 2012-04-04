
function CommandLine(cmd, resultparams, future) {
	this.command = cmd.trim();
	this.resultparams = resultparams;
	this.future = future;
	this.options = {
		encoding: "utf8"
		,timeout: 0
		//,maxBuffer: 200*1024
		//,killSignal: "SIGTERM"
		//,cwd: null
		//,env: null
	};
};

CommandLine.prototype.run = function(callback) {
	
	this.callback = callback;
	
	var exec = require("child_process").exec;
	var proc = exec(this.command, this.options, this._execHandler.bind(this));
};

CommandLine.prototype._execHandler = function(error, stdout, stderr) {
	
	this.stdout = stdout;
	this.stderr = stderr;
	this.errorCode = undefined;
	
	//strip sh error prefix
	if(this.stderr.startsWith("/bin/sh: ")) {
		this.stderr.replace("/bin/sh: ", "");
	}
	//strip mount error prefix
	//if(this.stderr.startsWith("mount error: ")) {
	//	this.stderr.replace("mount error: ", "");
	//}
	
	if(error) {
		this.errorCode = error.code || -1;
	}
	if(this.callback){
		this.callback({
			errorCode: this.errorCode
			,params: this.resultparams
			,resultText: this.stdout
			,errorText: this.stderr
			,future: this.future
		})
	}else if(this.future) {
		
		if(this.stdout && this.stdout.length > 0){
			if(!this.errorCode){
				this.errorCode = -1;
			}
			
			//Parse errors into friendly format - ignoringmount.cis manual check instruction
			var errors = this.stdout.split("\n");
			var returnErrors = [];
			if(errors && errors.length > 0){
				for(var i = 0; i < errors.length; i++){
					if(errors[i] && errors[i].length > 0 && errors[i].indexOf("mount.cifs") == -1){
						
						var errorSource = errors[i];
						var errorObject = {
							errorCode: undefined
							,errorText: undefined
						}
						if(errorSource.indexOf("=") == 0){
							errorObject.errorText = errorSource
						}else{
							var errorParts = errorSource.split("=")
							if(errorParts && errorParts.length > 0){
								for(var j = 0; j < errorParts.length; j++){
									var errorPart = errorParts[j].trim();
									var codeSource;
									//Check for error code:
									if(!errorObject.errorCode){
										var codeParts = errorPart.split(" ");
										if(codeParts && codeParts.length > 0){
											for(var k = 0; k < codeParts.length; k++){
												var codePart = codeParts[k];
												if(isNaN(codePart) == false){
													errorObject.errorCode = parseInt(codePart);
													codeSource = errorPart;
													break;
												}
											}
										}
									}
									errorObject.errorCode = errorObject.errorCode ? errorObject.errorCode : -1;
									//if(isNaN(errorPart) == false){
									//	errorObject.errorCode = parseInt(errorPart);
									//}
									//Check for error text (comes after error code)
									if(codeSource !== errorPart){
										if(errorObject.errorCode && errorPart && errorPart.length > 0){
											errorObject.errorText = errorPart;
											//got code and text so break out
											break;
										}
									}
								}
							}
						}
						//assign unknown error code.
						if(!errorObject.errorCode){
							errorObject.errorCode = -1;
						}
						returnErrors.push(errorObject);
					}
				}
				if(returnErrors.length > 0){
					this.resultparams.errors = returnErrors;
				}				
			}

		}
		
		if(!this.errorCode) {
			//Bingo!
			this.future.result = {
				params: this.resultparams
				,stderr:this.stderr
				,stdout:this.stdout
				//,command:this.command
			};
		} else {
			//Uh-oh :(
			this.future.result = {
				errorText:this.stderr + this.stdout,
				errorCode:this.errorCode,
				params: this.resultparams
				//command:this.command,
				//returnValue:false
			};
		}
	}
};

CommandLine.prototype._parseCmd = function() {
	this.cmdArray = [];
	var cmd = this.command;
	cmd = cmd.replace(" ; sync", "");
	while(cmd.length>0) {
		if(cmd.charAt(0)=="\"") {
			cmd = cmd.substring(1);
			var end = cmd.indexOf("\"");
			this.cmdArray.push(cmd.substring(0, end));
			cmd = cmd.substring(end+1);
		} else if(cmd.charAt(0)=="'") {
			cmd = cmd.substring(1);
			var end = cmd.indexOf("'");
			this.cmdArray.push(cmd.substring(0, end));
			cmd = cmd.substring(end+1);
		} else{
			var end = cmd.indexOf(" ");
			if(end<=0) {
				this.cmdArray.push(cmd);
				cmd = "";
			} else {
				this.cmdArray.push(cmd.substring(0, end));
				cmd = cmd.substring(end+1);
			}
			
		}
		cmd = cmd.trim();
	}
};


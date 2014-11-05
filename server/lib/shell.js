Meteor.startup(function () {
	var Fiber = Npm.require('fibers');
	//var Fiber = require('fibers');
	
	Meteor.methods({
	  getCurrentTime: function () {
		console.log('on server, getCurrentTime called');
		return new Date();
	  },
 
	  runshell: function (name, argArray) {
	   console.log('server, calling : ', name , ' with args ', argArray);
		if(name==undefined || name.length<=0) {
	      throw new Meteor.Error(404, "Please enter your name");
		}
		spawn = Npm.require('child_process').spawn;

		command = spawn(name, argArray);

		command.stdout.on('data',  function (data) {
	  	  console.log('stdout: ' + data);
  	    Fiber(function() { 
			var fiber = Fiber.current;
			
		  	blobStream = Blobs.upsertStream({ filename: 'ls_result.txt',
		                                 	contentType: 'text/plain',
		                                 	metadata: { caption: 'Not again!', 
										 				command: name,
														args: argArray
												      }
		                               	 },
									 	{options:{mode:'w'}},
										function() {
											console.log('inside callback');
											fiber.run(data);
										});
			ret = blobStream.write(data, function(){
				console.log('write is DONE')
			});
			if (!ret) {
				ret = blobStream.write(data, function(){
					console.log('write is DONE')
				});
			}
			retend = blobStream.end();
			console.log('write returns',ret,' end returns ',retend)
			var results = Fiber.yield();
			console.log('DONE results: ',results);
		}).run();   /* Fiber */
						
		});

		command.stderr.on('data', function (data) {
	  	  console.log('stderr: ' + data);
		});

		command.on('exit', function (code) {
	  	  console.log('child process exited with code ' + code);
		});
	  }
	});
  });


/* 
http://journal.gentlenode.com/meteor-14-execute-a-unix-command/
*/
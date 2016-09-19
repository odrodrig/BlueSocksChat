/*eslint-env node*/

//------------------------------------------------------------------------------
// node.js starter application for Bluemix

// Blue Socks Chat Application Authors
// This application is based off of the socket.io chat example seen here (https://github.com/socketio/socket.io)
// Watson Tone Analyzer and SockBot implementation built by Stefania Kacmarczyk (https://github.com/slkaczma)
// Language Translation implemented by Oliver Rodriguez (https://github.com/odrodrig)
//------------------------------------------------------------------------------

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

//Pull in Watson Developer Cloud library
var watson = require('watson-developer-cloud');

// cfenv provides access to your Cloud Foundry environment
// for more info, see: https://www.npmjs.com/package/cfenv
var cfenv = require('cfenv');

// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();

/*********************************************************************************************************
                                           Parsing Service Credentials
*********************************************************************************************************/

//get services from environment variables
var services = appEnv.services;

console.log(services);

var username = "";
var password = "";

if(appEnv.isLocal) {
  console.log("Running Locally. Deploy to Bluemix for this app to work.");
} else {
  //If running in the cloud, then we will pull the service credentials from the environment variables
  console.log("Running in Cloud");
  var watsonCreds = services['language_translation'][0].credentials;
  var toneCreds = services['tone_analyzer'][0].credentials;

  username = watsonCreds.username;
  password = watsonCreds.password;

  toneUser = toneCreds.username;
  tonePass = toneCreds.password;

}

var language_translation = watson.language_translation({
  username: username,
  password: password,
  version: 'v2'
});

var tone_analyzer = watson.tone_analyzer({
  url: 'https://gateway.watsonplatform.net/tone-analyzer/api/',
  username: toneUser,
  password: tonePass,
  version_date: '2016-05-19',
  version: 'v3'
});


/*********************************************************************************************************
                                        End of Parsing Service Credentials
*********************************************************************************************************/

// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));

http.listen(appEnv.port, function(){
  console.log('listening on '+ appEnv.port);
});

// Chatroom

var numUsers = 0;
var chatHistory= [];

io.on('connection', function (socket) {
  var addedUser = false;
  console.log("connected to socket.io");

  // when the client emits 'new message', this listens and executes
  socket.on('new message', function (data) {
    // we tell the client to execute 'new message'

	console.log('in new message: ' + data);
	chatHistory.push(data.message);

	getTone(data.message);

    socket.broadcast.emit('new message', {
      username: socket.username,
      message: data.message
    });
  });

  // when the client emits 'add user', this listens and executes
  socket.on('add user', function (username) {
    if (addedUser) return;
    console.log("added user");

    // we store the username in the socket session for this client
    socket.username = username;
    ++numUsers;
    addedUser = true;
    socket.emit('login', {
      numUsers: numUsers
    });
    // echo globally (all clients) that a person has connected
    socket.broadcast.emit('user joined', {
      username: socket.username,
      numUsers: numUsers
    });
  });

  // when the client emits 'typing', we broadcast it to others
  socket.on('typing', function () {
    socket.broadcast.emit('typing', {
      username: socket.username
    });
  });

  // when the client emits 'stop typing', we broadcast it to others
  socket.on('stop typing', function () {
    socket.broadcast.emit('stop typing', {
      username: socket.username
    });

    //Add watson stuff here?
  });

  // when the user disconnects.. perform this
  socket.on('disconnect', function () {
    if (addedUser) {
      --numUsers;

      // echo globally that this client has left
      socket.broadcast.emit('user left', {
        username: socket.username,
        numUsers: numUsers
      });
    }
  });

 /**********************************************************************************************************
                                           Translation Socket
 ***********************************************************************************************************/

  //When a translation tag is read from chat
  socket.on('translate', function(data) {

  	console.log(data.message);
  	console.log(data.sourceLang);
  	console.log(data.targetLang);
  	getTone(data.message);


  	language_translation.translate({
  		text: data.message, source : data.sourceLang, target: data.targetLang },
  		function (err, translation) {

  			console.log("Watson will translate : " + data.message);

    		if (err) {
      		console.log('error:', err);

          socket.emit('translationResults', {
            username: socket.username,
            message: "Error translating. Try again."
          });

          socket.broadcast.emit('translationResults', {
            username: socket.username,
            message: "Error translating. Try again."
          });

    		} else {
      			console.log(translation.translations[0].translation);
      			data.message = translation.translations[0].translation;

      			socket.emit('translationResults', {
			    	username: socket.username,
			    	message: data.message
			      });

    		    socket.broadcast.emit('translationResults', {
    		    	username: socket.username,
    		    	message: data.message
    		    });
        }
	    }
    );

  });

  /**********************************************************************************************************
                                         End of Translation Socket
  ***********************************************************************************************************/
function getTone(data){
	var tones;
	var message;
	var name;
	var score;

  	tone_analyzer.tone({text:data}, function(err, results) {
    	if (err)
    		console.log("Error getting tone: "+err);
    	else {
    		tones = results.document_tone.tone_categories[0].tones;
    		var stats = [];

			for(var i=0; i<tones.length; i++){
				name = tones[i].tone_name;
				score = tones[i].score;

				stats.push(score);

				console.log(name+":"+score);
			}

			var topTrait = Math.max.apply(Math,stats);
			var topTraitPercent = (topTrait *100).toFixed(2)+"%";

			switch(topTrait){
					case stats[0]:
						name = tones[0].tone_name;
						message = "The chat is too volatile. Let's be nice! Anger at "+topTraitPercent;
						botTalk(message);
						break;
					case stats[1]:
						name = tones[1].tone_name;
						break;
					case stats[2]:
						name = tones[2].tone_name;
						break;
					case stats[3]:
						name = tones[3].tone_name;
						break;
					case stats[4]:
						name = tones[4].tone_name;
						message = "Cheer up "+socket.username+". Sadness at "+topTraitPercent;
						botTalk(message);
						break;
			}
		}
	});

  }

  function botTalk(message){
	socket.emit('new message', {
		username:"SockBot",
		message: message
	});

	socket.broadcast.emit('new message', {
		username: "SockBot",
		message: message
	});
}


});

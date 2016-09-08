$(function() {

  var FADE_TIME = 150; // ms
  var TYPING_TIMER_LENGTH = 400; // ms
  var COLORS = [
    '#e21400', '#91580f', '#f8a700', '#f78b00',
    '#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
    '#3b88eb', '#3824aa', '#a700ff', '#d300e7'
  ];

  // Initialize variables
  var $window = $(window);
  var $usernameInput = $('.usernameInput'); // Input for username
  var $messages = $('.messages'); // Messages area
  var $inputMessage = $('.inputMessage'); // Input message input box
  var $dropInput = $('.dropdown-menu li a'); //dropdown menu

  var $loginPage = $('.login.page'); // The login page
  var $chatPage = $('.chat.page'); // The chatroom page
  var $button = $('.btn');

  // Prompt for setting a username
  var username;
  var connected = false;
  var typing = false;
  var lastTypingTime;
  var $currentInput = $usernameInput.focus();

  //Default language settings
  var sourceLang = "en";
  var targetLang = "es";

  var socket = io();

  function addParticipantsMessage (data) {
    var message = '';
    if (data.numUsers === 1) {
      message += "there's 1 participant";
    } else {
      message += "there are " + data.numUsers + " participants";
    }
    log(message);
  }

  // Sets the client's username
  function setUsername () {
    username = cleanInput($usernameInput.val().trim());

    // If the username is valid
    if (username) {
      $loginPage.fadeOut();
      $chatPage.show();
      $loginPage.off('click');
      $currentInput = $inputMessage.focus();

      // Tell the server your username
      socket.emit('add user', username);

    }
  }

  // Sends a chat message
  function sendMessage () {
    var message = $inputMessage.val();
    // Prevent markup from being injected into the message
    message = cleanInput(message);


    // if there is a non-empty message and a socket connection
    if (message && connected) {
      $inputMessage.val('');

      addChatMessage({
        username: username,
        message: message
      });

      console.log(message);

      /************************************************************************************************************
                                            Translation Handling
      *************************************************************************************************************/

      //Translate to Spanish
      if(message.substring(0, 18).toLowerCase() == "/translate spanish") {
      	console.log('sending to translate');
        targetLang = "es";

      	socket.emit('translate', {message: message.substring(19), sourceLang: sourceLang, targetLang: targetLang});

      }

      //Translate to French
      else if(message.substring(0, 17).toLowerCase() == "/translate french") {
        console.log('sending to translate');
        targetLang = "fr";

        socket.emit('translate', {message: message.substring(18), sourceLang: sourceLang, targetLang: targetLang});

      } 

      //Translate to Italian
      else if(message.substring(0, 18).toLowerCase() == "/translate italian") {
        console.log('sending to translate');
        targetLang = "it";

        socket.emit('translate', {message: message.substring(19), sourceLang: sourceLang, targetLang: targetLang});

      }

      //Translate to Arabic
      else if(message.substring(0, 17).toLowerCase() == "/translate arabic") {
        console.log('sending to translate');
        targetLang = "ar";

        socket.emit('translate', {message: message.substring(18), sourceLang: sourceLang, targetLang: targetLang});

      }

      //Translate to Portuguese
      else if(message.substring(0, 21).toLowerCase() == "/translate portuguese") {
        console.log('sending to translate');
        targetLang = "pt";

        socket.emit('translate', {message: message.substring(22), sourceLang: sourceLang, targetLang: targetLang});

      }

      //Translate to English
      else if(message.substring(0, 18).toLowerCase() == "/translate english") {
        console.log('sending to translate');
        targetLang = "en";

        socket.emit('translate', {message: message.substring(19), sourceLang: sourceLang, targetLang: targetLang});

      }

      //If no translation tag is found
      else /* if(message.substring(0, 10).toLowerCase() != "/translate") */ {
        console.log("not translating");
        socket.emit('new message', {message: message});
      }
    }
  }

  /************************************************************************************************************
                                        End of Translation Handling
  *************************************************************************************************************/

  // Log a message
  function log (message, options) {
    var $el = $('<li>').addClass('log').text(message);
    addMessageElement($el, options);
  }

  // Adds the visual chat message to the message list
  function addChatMessage (data, options) {
    // Don't fade the message in if there is an 'X was typing'
    var $typingMessages = getTypingMessages(data);
    options = options || {};
    if ($typingMessages.length !== 0) {
      options.fade = false;
      $typingMessages.remove();
    }

    var $usernameDiv = $('<span class="username"/>')
      .text(data.username)
      .css('color', getUsernameColor(data.username));
    var $messageBodyDiv = $('<span class="messageBody">')
      .text(data.message);

    var typingClass = data.typing ? 'typing' : '';
    var $messageDiv = $('<li class="message"/>')
      .data('username', data.username)
      .addClass(typingClass)
      .append($usernameDiv, $messageBodyDiv);

    addMessageElement($messageDiv, options);
  }

  // Adds the visual chat typing message
  function addChatTyping (data) {
    data.typing = true;
    data.message = 'is typing';
    addChatMessage(data);
  }

  // Removes the visual chat typing message
  function removeChatTyping (data) {
    getTypingMessages(data).fadeOut(function () {
      $(this).remove();
    });
  }

  // Adds a message element to the messages and scrolls to the bottom
  // el - The element to add as a message
  // options.fade - If the element should fade-in (default = true)
  // options.prepend - If the element should prepend
  //   all other messages (default = false)
  function addMessageElement (el, options) {
    var $el = $(el);

    // Setup default options
    if (!options) {
      options = {};
    }
    if (typeof options.fade === 'undefined') {
      options.fade = true;
    }
    if (typeof options.prepend === 'undefined') {
      options.prepend = false;
    }

    // Apply options
    if (options.fade) {
      $el.hide().fadeIn(FADE_TIME);
    }
    if (options.prepend) {
      $messages.prepend($el);
    } else {
      $messages.append($el);
    }
    $messages[0].scrollTop = $messages[0].scrollHeight;
  }

  // Prevents input from having injected markup
  function cleanInput (input) {
    return $('<div/>').text(input).text();
  }

  // Updates the typing event
  function updateTyping () {
    if (connected) {
      if (!typing) {
        typing = true;
        socket.emit('typing');
      }
      lastTypingTime = (new Date()).getTime();

      setTimeout(function () {
        var typingTimer = (new Date()).getTime();
        var timeDiff = typingTimer - lastTypingTime;
        if (timeDiff >= TYPING_TIMER_LENGTH && typing) {
          socket.emit('stop typing');
          typing = false;
        }
      }, TYPING_TIMER_LENGTH);
    }
  }

  // Gets the 'X is typing' messages of a user
  function getTypingMessages (data) {
    return $('.typing.message').filter(function (i) {
      return $(this).data('username') === data.username;
    });
  }

  // Gets the color of a username through our hash function
  function getUsernameColor (username) {
    // Compute hash code
    var hash = 7;
    for (var i = 0; i < username.length; i++) {
       hash = username.charCodeAt(i) + (hash << 5) - hash;
    }
    // Calculate color
    var index = Math.abs(hash % COLORS.length);
    return COLORS[index];
  }

  // Keyboard events

  $window.keydown(function (event) {
    // Auto-focus the current input when a key is typed
    if (!(event.ctrlKey || event.metaKey || event.altKey)) {
      $currentInput.focus();
    }
    // When the client hits ENTER on their keyboard
    if (event.which === 13) {
      if (username) {
        sendMessage();
        socket.emit('stop typing');
        typing = false;
      } else {
        setUsername();
      }
    }
  });

  //Alerts users when typing is detected
  $inputMessage.on('input', function() {
    updateTyping();
  });

  // Click events

  // Focus input when clicking anywhere on login page
  $loginPage.click(function () {
    $currentInput.focus();
  });

  // Focus input when clicking on the message input's border
  $inputMessage.click(function () {
    $inputMessage.focus();
  });

  /*********************************************************************************************************
                                      Language Selection
  *********************************************************************************************************/

  //Set source language from dropdown menu selection
  $dropInput.click(function(){

    console.log($(this).text());


    if($(this).text() == "English") {
      console.log("sourceLang = en");
      sourceLang = "en";
    }

    if($(this).text() == "Español") {
      console.log("sourceLang = es");
      sourceLang = "es";
    }

    if($(this).text() == "Français") {
      console.log("sourceLang = fr");
      sourceLang = "fr";
    }

    if($(this).text() == "العربية") {
      console.log("sourceLang = ar");
      sourceLang = "ar";
    }

    if($(this).text() == "Português") {
      console.log("sourceLang = pt");
      sourceLang = "pt";
    }

    $button.text($(this).text());
  
  });

  /*********************************************************************************************************
                                        End of Language Selection
  *********************************************************************************************************/

  // Socket events

  // Whenever the server emits 'login', log the login message
  socket.on('login', function (data) {
    connected = true;
    // Display the welcome message
    var message = "Welcome to Socket.IO Chat – ";
    log(message, {
      prepend: true
    });
    addParticipantsMessage(data);
  });

  // Whenever the server emits 'new message', update the chat body
  socket.on('new message', function (data) {
    addChatMessage(data);
    console.log(data);
  });

  // Whenever the server emits 'user joined', log it in the chat body
  socket.on('user joined', function (data) {
    log(data.username + ' joined');
    addParticipantsMessage(data);
  });

  // Whenever the server emits 'user left', log it in the chat body
  socket.on('user left', function (data) {
    log(data.username + ' left');
    addParticipantsMessage(data);
    removeChatTyping(data);
  });

  // Whenever the server emits 'typing', show the typing message
  socket.on('typing', function (data) {
    addChatTyping(data);
  });

  // Whenever the server emits 'stop typing', kill the typing message
  socket.on('stop typing', function (data) {
    removeChatTyping(data);
  });

  /***********************************************************************************************************
                                        Socket to accept translations
  ***********************************************************************************************************/

  //display the returned translation
  socket.on('translationResults', function(data) {
  	addChatMessage(data);
  	console.log('translationResults recieved');
  	console.log(data);
  });


});
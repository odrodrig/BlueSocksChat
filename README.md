# BlueSocksChat

##Overview

The Blue Socks Chat application is a chat application using Socket.io, IBM Bluemix, Watson Language Translation, and Watson Tone Analyzer. Using this application, we will build your very own chatroom to chat with friends. Using the Watson Language Translation, we will be able to do translations on the fly with a simple command. Also, while you chat there is a chat bot named "sockBot" who will use the Watson Tone Analyzer service to analyze they chat messages. The bot will then alert the users if the the messages are either angry or sad.



###How to Use

Once in the application, choose a nickname that will appear to other users and select the language you are fluent in (English is the default).
To translate, start your message with "/translate 'language'" replacing 'language' with the language you want to translate to. For example, if I wanted to translate "Hi my name is Oliver" to spanish, I would type "/translate spanish Hello my name is Oliver" and the translated spanish output would be sent to the chat room.

###The Services

1. Watson Language Translation
	* Watson Language Translation allows you to translate English to/from Brazilian Portuguese, French, Modern Standard Arabic, or Spanish. In our application, we are translating sentences in the chatroom.

2. Watson Tone Analyzer
	* Watson Tone Analyzer analyzes text that you send the service and returns the tone detected in the conversation. Using this service, you are able to extract emotion such as anger, disgust, fear, joy, and sadness. In our application, we use the service in our "SockBot" that is monitoring the chat for any angry or sad messages and promptly offer a comforting message.

##Instructions

To get the application deployed, start by clicking on the button below. This will open up the "Deploy to Bluemix" page.

1. This tool requires a Bluemix account so you will need to either create one or log in with your existing account.
2. Start by creating a unique name for your application. For example, if my name is John Smith, I'd use jsBluesocks
3. and verifying the bluemix information.
4. If everything is correct, click Deploy.

[![Deploy to Bluemix](https://bluemix.net/deploy/button.png)](https://bluemix.net/deploy?repository=https://github.com/odrodrig/BlueSocksChat.git)

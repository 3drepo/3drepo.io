# Notification

When other users doing different actions like uploading a model or leaving a comment, they will trigger events
and these events will be broadcasted via websockets to all listeners.

The websocket server implemented using socket.io library and the following examples use only socket.io client to show you how to
connect to it. It is also possible to use native APIs and other libraries to do it but is not mentioned in this document.



## Connecting to websocket server

> Example:

```javascript
	var socket = io('https://example.org:3000', {
		path: '/path', 
		transports: ['websocket']
	});
```

The address is wss://`hostname`:`port`/chat/, it would be different if you changed the default config file.


## Joining a room

> Example:

```javascript
	socket.emit('join', {
		'account': 'teamspaceA',
		'model': '00000000-0000-0000-0000-000000000000'
	});
```

The message will be broadcasted to different rooms, before you can listen on any messages, you need to join a room first.
A room here represent a teamspace or a model.

For example, if you want to listen messages on model with id 00000000-0000-0000-0000-000000000000 in teamspaceA, you need to join the room 

`{account: 'teamspaceA', 'model': '00000000-0000-0000-0000-000000000000'}` 

first.

If you want to listen messages on all models in teamspaceA, you would want to join the room `{account: 'teamspaceA' }` instead.

If you don't have permission to join a room, the server will send an event `credentialError` to you.


## newIssues


> Example:

```javascript

	socket.emit('join', {
		'account': 'teamspaceA',
		'model': '00000000-0000-0000-0000-000000000000'
	});

	socket.on('teamspaceA::00000000-0000-0000-0000-000000000000::newIssues', function(issue){
		//...
	});

```

This message is broadcasted when some created a new issue. The response will be list of an [issue objects](#issue-object)



## newComment

> Example:

This message is broadcasted when someone leaves a new comment.

## commentChanged

> Example:

This message is broadcasted when someone edit a comment.

## commentDeleted

> Example:

This message is broadcasted when someone delete a comment.

## modelStatusChanged


> Example:

This message is broadcasted when the status of the model changed.

## issueChanged

> Example:

This message is broadcasted when the status of the issue changed.

## newModel

> Example:

This message is broadcasted when someone create a new blank model.

## credentialError

> Example:

This message is sent to the user who tried to join a room but has insufficient permissions.
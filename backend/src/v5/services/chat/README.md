# 3D Repo Chat Service (Real Time messenging)
3D Repo Chat Service allows users to connect to a [Socket.io](https://socket.io/) based service to receive push notifications on events such as New model revision, new issue etc.

Note: This is currently a work in progress, new events will be added as they are supported on the v5 front end revamp project. You may find some events may be available in the v4 service instead. Should you need assistence with using the v4 service, please contact support@3drepo.org

## Connecting to the service
You will need to use utilise a [Socket.io client library](https://socket.io/docs/v4/client-installation/) to connect to this service. Please check our [package.json](../../../../package.json) to see which version of Socket.io we are currently using.

You can find the domain to in the frontend config. e.g. For `https://www.3drepo.io/`, you can probe the config from `https://www.3drepo.io/config/config.js`, which contains the following information:
````js
{
  // ...
  "chatHost": "https:\u002F\u002Fchat.www.3drepo.io:443",
  "chatPath": "\u002Fchat",
}
````

Plug them into the io client as follows:
````js
const socket = ioClient(config.chatHost,
  {
    path: chatPath,
    transports: ['websocket'],
    reconnection: true,
    reconnectionDelay: 500,
  });
````

### Syncing your cookie session with your Socket.io connection
In order for your Socket.io connection to be authenticated and synchronized with your REST API requests, you will have to do one of the following:

1. If you logged in before your Socket.io connection is established, ensure you have passed the session header (`connect.sid`) is passed into your Socket.io client as [an extraHeader](https://socket.io/docs/v4/client-options/#extraheaders). This should be done automatically if you are connecting through a browser.
2. Once you have established your Socket.io connection, set ensure all your HTTP requests to the REST API has the header `x-socket-id` set to your socket ID.

## Rooms
To get a specific type of events, you will have to signal to join a room. Different room types will allow you to subscribe to different types of events

### Joining a room
Ensure you are authenticated to the service. To join a room, emit the a `join` event with the parameters described above. Upon success, the server will emit a `message` event notifying you that you have successfully subcribed to the room. On failure, an `error` event will emit instead:
````js
  // request to join the user notification room
  socket.emit("join", {notifications: true});

  socket.on("message", (data) => {
    // { event: "success", data: {action: "join", data: { notifications: true}}}
    console.log(data);     
  });
  
  socket.on("error", (data) => {
  // e.g. { code: "UNAUTHORISED", message: "You are not logged in", details: { action: "join", data: { notifications: true }} }
    console.log(data);
  });
````

### Leaving a room
To leave a room (unsubscribe to that type of events), emit a `leave` event with the same data as join:

````js
  // request to join the user notification room
  socket.emit("join", 
    { 
      teamspace: "john", 
      project: "a608516e-0fef-4185-bca8-bf03a256ad3d", 
      model: "808d98ee-aad1-11ec-b909-0242ac120002"
    }
  );

  socket.on("message", (data) => {
    // { event: "success", data: {action: "leave", data: { teamspace: "john", project: "a608516e-0fef-4185-bca8-bf03a256ad3d", model: "808d98ee-aad1-11ec-b909-0242ac120002"}}}
    console.log(data);     
  });
  
  socket.on("error", (data) => {
  // e.g. { code: "ROOM_NOT_FOUND", message: "Model not found", details: { teamspace: "john", project: "a608516e-0fef-4185-bca8-bf03a256ad3d", model: "808d98ee-aad1-11ec-b909-0242ac120002"}} }
    console.log(data);
  });
````
### Room types
#### User Notifications
  - Event parameters: `{ notifications: true }`
  - Description: Subscribe to new notifications sent to the authenticated user (e.g. import failures/success, issues assigned to user)

#### Container/Federation notifications
  - Event parameters: `{ teamspace: "<name of teamspace>", project: "<project id>", model: "<federation/container id>" }`
  - Description: Subscribe to new activity within the model (e.g. new revision, model settings update, new issues)

## Events
### General Events
The following events are emitted without requiring the client to join a room

#### message event
  - Event name: `message`
  - Data format: varies
  - Description: General messaging channel, mostly used to confirm an action has been completed (e.g. see [Joining a room](#joining-a-room))
  
#### error event
  - Event name: `error`
  - Data format: `{ code: "<string>", message: "<string>", details: { action: "<string>": data: { /* data sent for the action */}} }`
  - Description: Used to notify users of errors (e.g. see [Joining a room](#joining-a-room))
  
#### logged out event
  - Event name: `loggedOut`
  - Data format: `{ reason: "<string>" }`
  - Description: Used to notify the user if they have been logged out of the session

 


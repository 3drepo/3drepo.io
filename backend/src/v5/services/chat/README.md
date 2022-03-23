# 3D Repo Chat Service (Real Time messenging)
3D Repo Chat Service allows users to connect to a [Socket.io](https://socket.io/) based service to receive push notifications on events such as New model revision, new issue etc.

Note: This is currently a work in progress, new events will be added as they are supported on the v5 front end revamp project. You may find some events may be available in the v4 service instead. Should you need assistence with using the v4 service, please contact support@3drepo.org

## Table of Contents
- [Connecting to the service](#connecting-to-the-service)
  * [Syncing your cookie session with your Socket.io connection](#syncing-your-cookie-session-with-your-socketio-connection)
- [Rooms](#rooms)
  * [Joining a room](#joining-a-room)
  * [Leaving a room](#leaving-a-room)
  * [Room types](#room-types)
    + [User Notifications](#user-notifications)
    + [Container/Federation notifications](#containerfederation-notifications)
- [Events](#events)
  * [General Events](#general-events)
    + [message event](#message-event)
    + [error event](#error-event)
    + [logged out event](#logged-out-event)
  * [Container/Federation events](#containerfederation-events)
    + [Container Settings Update](#container-settings-update)
    + [Federation Settings Update](#federation-settings-update)

## Connecting to the service
You will need to use utilise a [Socket.io client library](https://socket.io/docs/v4/client-installation/) to connect to this service. Please check our [package.json](../../../../package.json) to see which version of Socket.io we are currently using.

You can find the domain to connect to within the frontend config. e.g. For `https://www.3drepo.io/`, perform a HTTP GET request to `https://www.3drepo.io/config/config.js`, which contains the following information:
````js
{
  // ...
  "chatHost": "https:\u002F\u002Fchat.www.3drepo.io:443",
  "chatPath": "\u002Fchat",
}
````

Plug them into the io client as follows:
````js
// Assuming the data from config.js is stored in a variable named "config"...
const socket = ioClient(config.chatHost,
  {
    path: config.chatPath,
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
Provided the client has subscribed to the room (where neccessary), the server will emit events when available. The client can [subscribe onto these events](https://socket.io/docs/v4/client-api/#socketoneventname-callback) just like regular Socket.io events

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

### Container/Federation events
The following events will be emitted if the user has subscribed to [Container/Federation notifications](#containerfederation-notifications).

#### Container Settings Update
  - Event name: `containerSettingsUpdate`
  - Data format: `{ teamspace: "teamspace name", project: "project id", model: "container id", data: { /* Changes on container settings */}}`
  - Description: Used to notify the user of any changes on the container settings. This will be triggered if there is a PATCH request, or any changes on the model status (i.e. updates from processing a new revision)

#### Federation Settings Update
  - Event name: `federationSettingsUpdate`
  - Data format: `{ teamspace: "teamspace name", project: "project id", model: "federation id", data: { /* Changes on federation settings */}}`
  - Description: Used to notify the user of any changes on the federation settings. This will be triggered if there is a PATCH request, or any changes on the model status (i.e. updates from processing editing the federation)

 


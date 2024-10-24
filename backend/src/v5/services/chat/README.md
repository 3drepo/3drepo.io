# 3D Repo Chat Service (Real Time messaging)
3D Repo Chat Service allows users to connect to a [Socket.io](https://socket.io/) based service to receive push notifications on events such as New model revision, new issue etc.

Note: This is currently a work in progress, new events will be added as they are supported on the v5 front end revamp project. You may find some events may be available in the v4 service instead. Should you need assistence with using the v4 service, please contact support@3drepo.com

## Table of Contents
- [Connecting to the service](#connecting-to-the-service)
  * [Syncing your cookie session with your Socket.io connection](#syncing-your-cookie-session-with-your-socketio-connection)
- [Rooms](#rooms)
  * [Joining a room](#joining-a-room)
  * [Leaving a room](#leaving-a-room)
  * [Room types](#room-types)
    + [User Notifications](#user-notifications)
    + [Project notifications](#project-notifications)
    + [Container/Federation/Drawing notifications](#containerfederationdrawing-notifications)
- [Events](#events)
  * [General Events](#general-events)
    + [message event](#message-event)
    + [error event](#error-event)
    + [logged out event](#logged-out-event)
  * [Container/Federation/Drawing events](#containerfederationdrawing-events)
    + [Container Settings Update](#container-settings-update)
    + [Container New Revision](#container-new-revision)
    + [Container Revision Update](#container-revision-update)
    + [Container Removed](#container-removed)
    + [Container New Ticket](#container-new-ticket)
    + [Container Update Ticket](#container-update-ticket)
    + [Container New Ticket Comment](#container-new-ticket-comment)
    + [Container Update Ticket Comment](#container-update-ticket-comment)
    + [Container Update Ticket Group](#container-update-ticket-group)
    + [Federation Settings Update](#federation-settings-update)
    + [Federation New Revision](#federation-new-revision)
    + [Federation Removed](#federation-removed)
    + [Federation New Ticket](#federation-new-ticket)
    + [Federation Update Ticket ](#federation-update-ticket)
    + [Federation New Ticket Comment](#federation-new-ticket-comment)
    + [Federation Update Ticket Comment](#federation-update-ticket-comment)
    + [Federation Update Ticket Group](#federation-update-ticket-group)
    + [Drawing Settings Update](#drawing-settings-update)
    + [Drawing Removed](#drawing-removed)
  * [Project events](#project-events)
    + [New Container](#new-container)
    + [New Federation](#new-federation)
    + [New Drawing](#new-drawing)

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

#### Project notifications
  - Event parameters: `{ teamspace: "<name of teamspace>", project: "<project id>" }`
  - Description: Subscribe to new activity within the project (e.g. new container, new federation)

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
The following events will be emitted if the user has subscribed to [Container/Federation notifications](#containerfederationdrawing-notifications).

#### Container Settings Update
  - Event name: `containerSettingsUpdate`
  - Data format: `{ teamspace: "teamspace name", project: "project id", model: "container id", data: { /* Changes on container settings */}}`
  - Description: Used to notify the user of any changes on the container settings. This will be triggered if there is a PATCH request, or any changes on the model status (i.e. updates from processing a new revision)

#### Container New Revision
  - Event name: `containerNewRevision`
  - Data format: `{ teamspace: "teamspace name", project: "project id", model: "container id", data: { _id: "revId", tag: "tag", timestamp: 123, // epoch ts  author: "author name" }}`
  - Description: Used to notify the user of a new container revision addition. This will be triggered when a new container revision has been processed successfully

#### Container Revision Update
  - Event name: `containerRevisionUpdate`
  - Data format: `{ teamspace: "teamspace name", project: "project id", model: "container id", data: { _id: "revId", void: "true" }}`
  - Description: Used to notify the user of any changes on a revision. This will be triggered when some data has changed within a revision (currently only void status can be changed)

#### Container Removed
  - Event name: `containerRemoved`
  - Data format: `{ teamspace: "teamspace name", project: "project id", model: "container id", data: { }}`
  - Description: Used to notify the user of a container deletion. This will be triggered when a container has been removed from a project

#### Container New Ticket
  - Event name: `containerNewTicket`
  - Data format: `{ teamspace: "teamspace name", project: "project id", model: "container id", data: { /* ticket data */ }}`
  - Description: Used to notify the user of a ticket addition to a container.

#### Container Update Ticket
  - Event name: `containerUpdateTicket`
  - Data format: `{ teamspace: "teamspace name", project: "project id", model: "container id", data: { _id: "ticketId", /* fields that has been updated */ }}`
  - Description: Used to notify the user of a ticket update in a container.

#### Container New Ticket Comment
  - Event name: `containerNewTicketComment`
  - Data format: `{ teamspace: "teamspace name", project: "project id", model: "container id", data: { ticket: "ticket id", /* comment data */ }}`
  - Description: Used to notify the user of a comment addition to a container ticket.

#### Container Update Ticket Comment
  - Event name: `containerUpdateTicketComment`
  - Data format: `{ teamspace: "teamspace name", project: "project id", model: "container id", data: { ticket: "ticket id" , /* fields that has been updated */ }}`
  - Description: Used to notify the user of a comment update in a container ticket.

#### Container Update Ticket Group
  - Event name: `containerUpdateTicketGroup`
  - Data format: `{ teamspace: "teamspace name", project: "project id", model: "container id", data: { ticket: "ticket id" , _id: "group id",/* fields that has been updated */ }}`
  - Description: Used to notify the user of a group update in a container ticket.

#### Federation Settings Update
  - Event name: `federationSettingsUpdate`
  - Data format: `{ teamspace: "teamspace name", project: "project id", model: "federation id", data: { /* Changes on federation settings */}}`
  - Description: Used to notify the user of any changes on the federation settings. This will be triggered if there is a PATCH request, or any changes on the model status (i.e. updates from processing editing the federation)

#### Federation New Revision
  - Event name: `federationNewRevision`
  - Data format: `{ teamspace: "teamspace name", project: "project id", model: "federation id", data: { _id: "revId", tag: "tag", timestamp: 123, // epoch ts  owner: "owner name" }}`
  - Description: Used to notify the user of a new federation revision addition. This will be triggered when a new federation revision has been processed successfully
 
#### Federation Removed
  - Event name: `federationRemoved`
  - Data format: `{ teamspace: "teamspace name", project: "project id", model: "federation id", data: { }}`
  - Description: Used to notify the user of a federation deletion. This will be triggered when a federation has been removed from a project

#### Federation New Ticket
  - Event name: `federationNewTicket`
  - Data format: `{ teamspace: "teamspace name", project: "project id", model: "federation id", data: { /* ticket data */ }}`
  - Description: Used to notify the user of a ticket addition to a federation.

#### Federation Update Ticket
  - Event name: `federationUpdateTicket`
  - Data format: `{ teamspace: "teamspace name", project: "project id", model: "federation id", data: { _id: "ticketId", /* fields that has been updated */ }}`
  - Description: Used to notify the user of a ticket update in a federation.

#### Federation New Ticket Comment
  - Event name: `federationNewTicketComment`
  - Data format: `{ teamspace: "teamspace name", project: "project id", model: "federation id", data: { ticket: "ticket id", /* comment data */ }}`
  - Description: Used to notify the user of a comment addition to a federation ticket.

#### Federation Update Ticket Comment
  - Event name: `federationUpdateTicketComment`
  - Data format: `{ teamspace: "teamspace name", project: "project id", model: "federation id", data: { ticket: "ticket id" , /* fields that has been updated */ }}`
  - Description: Used to notify the user of a comment update in a federation ticket.

#### Federation Update Ticket Group
  - Event name: `federationUpdateTicketGroup`
  - Data format: `{ teamspace: "teamspace name", project: "project id", model: "federation id", data: { ticket: "ticket id" , _id: "group id",/* fields that has been updated */ }}`
  - Description: Used to notify the user of a group update in a federation ticket.

#### Drawing Settings Update
  - Event name: `drawingSettingsUpdate`
  - Data format: `{ teamspace: "teamspace name", project: "project id", model: "drawing id", data: { /* Changes on drawing settings */}}`
  - Description: Used to notify the user of any changes on the drawing settings. This will be triggered if there is a PATCH request, or any changes on the model status (i.e. updates from processing a new revision)

#### Drawing Removed
  - Event name: `drawingRemoved`
  - Data format: `{ teamspace: "teamspace name", project: "project id", model: "drawing id", data: { }}`
  - Description: Used to notify the user of a drawing deletion. This will be triggered when a drawing has been removed from a project

### Project events
The following events will be emitted if the user has subscribed to [Project notifications](#project-notifications).

#### New Container
  - Event name: `newContainer`
  - Data format: `{ teamspace: "teamspace name", project: "project id", data: { _id: "container id", name: "container name", code: "container code", type: "container type" }}`
  - Description: Used to notify the user of a container creation. This will be triggered when a container has been added from a project

#### New Federation
  - Event name: `newFederation`
  - Data format: `{ teamspace: "teamspace name", project: "project id", data: { _id: "federation id", name: "federation name", code: "federation code", desc: "federation description" }}`
  - Description: Used to notify the user of a federation creation. This will be triggered when a federation has been added from a project

#### New Drawing
  - Event name: `newDrawing`
  - Data format: `{ teamspace: "teamspace name", project: "project id", data: { _id: "drawing id", name: "drawing name", number: "drawing number", type: "drawing type" }}`
  - Description: Used to notify the user of a drawing creation. This will be triggered when a drawing has been added from a project
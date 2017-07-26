# Issue

<aside class="notice">
Creating an issue or a comment via HTTP API will also triggers the server to broadcast a web socket message to all listeners. 
To avoid getting back your own message via the websocket, please add a custom header named `x-socket-id` with your 
web socket client id returned from connecting to the web socket server when making HTTP API requests.
</aside>

## Issue object

*Read only = Shown in response only. Ignore if persence in request body.

Attribute       | Description                                         | Read only
--------------- | ----------------------------------------------------|-----
_id             | comment id                                          | Yes
account         | the teamspace this issue belongs to  | Yes
model           | the model this issue belongs to  | Yes
viewpoint       | [viewpoint object](#viewpoint-object)
creator_role    | 
pickedPos       | array of three numbers
pickedNorm      | array of three numbers
scale           |
assigned_roles  | array of assigned roles
priority        | 
status |
topic_type |
desc |
position | pin position
norm | pin normal 
group_id | Group ref that contains all highlighted objects
comments       | list of [comment objects](#comment-object), only shown in get an issue API. | Yes
rev_id         | the revision when the issue was created, only set if using the [revision version API](#post-accountname-modelid-revision-revid-issues-json)


### Viewpoint object

Attribute       | Format                        | 
----------------|-------------------------------|
right           | array of three numbers        |
up              | array of three numbers        |
position        | array of three numbers        |
look_at         | array of three numbers        |
view_dir        | array of three numbers        |
near            | numbers                       |
far             | numbers                       |
fov             | numbers                       |
aspect_ratio    | numbers                       | 
clippingPlanes  | numbers                       | 
screenshot      | string of base 64 encoded png in request body, an URL in response | 

### Comment object

Attribute       | Description                                                       | Format      | Read only
----------------|-------------------------------------------------------------------|-------------|---------------------
action          | [action object](#action-object), only presence in automated comment          |             | Y
owner           | username who leaves the comment                                   | string      | Y
comment         | content of comment                                                | string      |
created         | timestamp of the comment creation                                 | number      | Y
sealed          | is the comment editable                                           | Boolean     | Y
rev_id          | the revision when the comment was created, only set if using the [revision version API](#put-accountname-modelid-revision-revid-issues-issueid-json) | string |
guid            | id of the comment                                                 | string | Y
viewpoint       | [viewpoint object](#viewpoint-object)


### Action object
Attribute       | Description                                                       
----------------|-------------------------------------------------------------------
property        | issue status property name
from | old property value
to | new property value

## Get an issue

### GET /{accountName}/{modelId}/issues/{issueId}.json

The response includes comments of the issue and all the screenshots are represented by an URL of the resources.

> Example request

```http
GET /repoman/68ddc470-9ebe-4520-9d91-a35da65cc610/issues/d7090f40-5a78-11e7-b7f1-2968aca83c11.json HTTP/1.1
```
```json
{
   "_id":"d7090f40-5a78-11e7-b7f1-2968aca83c11",
   "creator_role":"Architect",
   "scale":1,
   "priority":"none",
   "desc":"Various models can be federated in 3D Repo",
   "topic_type":"for_information",
   "status":"open",
   "owner":"repoman",
   "created":1498486070843,
   "name":"Go to Sample_Federation for more",
   "number":5,
   "rev_id":"cd561c86-de1a-482e-8f5d-89cfc49562e8",
   "__v":1,
   "assigned_roles":[

   ],
   "viewCount":3,
   "commentCount":1,
   "comments":[
      {
         "owner":"repoman",
         "comment":"All federations are shown in project's Federations folder",
         "created":1498486126944,
         "rev_id":"cd561c86-de1a-482e-8f5d-89cfc49562e8",
         "guid":"9aed5b71-0768-46bf-ac7e-52abae384e6f",
         "viewpoint":{
            "near":93.22692108154297,
            "far":46613.4609375,
            "fov":1.0471975803375244,
            "aspect_ratio":1.4831358194351196,
            "guid":"b4244782-a112-4a8a-a5f1-6a13c0ce5794",
            "_id":"5951156e1a1e367c590de079",
            "type":"perspective",
            "clippingPlanes":[

            ],
            "right":[
               -0.5469865798950195,
               0,
               0.8371413350105286
            ],
            "view_dir":[
               0.6944281458854675,
               -0.5584722757339478,
               0.45373809337615967
            ],
            "look_at":[
               8159.1533203125,
               3831.880859375,
               -9764.24609375
            ],
            "position":[
               -14553.9365234375,
               22098.177734375,
               -24604.9375
            ],
            "up":[
               0.46752026677131653,
               0.8295232057571411,
               0.3054768741130829
            ]
         },
         "_id":"5951156e1a1e367c590de07a"
      }
   ],
   "thumbnail":"repoman/68ddc470-9ebe-4520-9d91-a35da65cc610/issues/d7090f40-5a78-11e7-b7f1-2968aca83c11/thumbnail.png",
   "norm":[

   ],
   "position":[

   ],
   "viewpoint":{
      "near":93.22692108154297,
      "far":46613.4609375,
      "fov":1.0471975803375244,
      "aspect_ratio":1.4831358194351196,
      "guid":"ce12a2a9-6f0e-4a37-aa87-3ddd52307fe0",
      "_id":"595115361a1e367c590de068",
      "type":"perspective",
      "screenshot":"repoman/68ddc470-9ebe-4520-9d91-a35da65cc610/issues/d7090f40-5a78-11e7-b7f1-2968aca83c11/viewpoints/ce12a2a9-6f0e-4a37-aa87-3ddd52307fe0/screenshot.png",
      "clippingPlanes":[

      ],
      "right":[
         -0.5469865798950195,
         0,
         0.8371413350105286
      ],
      "view_dir":[
         0.6944281458854675,
         -0.5584722757339478,
         0.45373809337615967
      ],
      "look_at":[
         8159.1533203125,
         3831.880859375,
         -9764.24609375
      ],
      "position":[
         -14553.9365234375,
         22098.177734375,
         -24604.9375
      ],
      "up":[
         0.46752026677131653,
         0.8295232057571411,
         0.3054768741130829
      ],
      "screenshotSmall":"repoman/68ddc470-9ebe-4520-9d91-a35da65cc610/issues/d7090f40-5a78-11e7-b7f1-2968aca83c11/viewpoints/ce12a2a9-6f0e-4a37-aa87-3ddd52307fe0/screenshotSmall.png"
   },
   "typePrefix":"Architectural",
   "modelCode":"LEGO",
   "account":"repoman",
   "model":"68ddc470-9ebe-4520-9d91-a35da65cc610"
}
```

## Get issues

### GET /{accountName}/{modelId}/issues.json
### GET /{accountName}/{modelId}/revision/{revId}/issues.json

Similar to get an issue API but the issues in this response doesn't contains comments.

> Example response

```http
GET /repoman/68ddc470-9ebe-4520-9d91-a35da65cc610/issues.json HTTP/1.1
```
```json
[
	{
	   "_id":"d7090f40-5a78-11e7-b7f1-2968aca83c11",
	   "creator_role":"Architect",
	   "scale":1,
	   "priority":"none",
	   "desc":"Various models can be federated in 3D Repo",
	   "topic_type":"for_information",
	   "status":"open",
	   "owner":"repoman",
	   "created":1498486070843,
	   "name":"Go to Sample_Federation for more",
	   "number":5,
	   "rev_id":"cd561c86-de1a-482e-8f5d-89cfc49562e8",
	   "__v":1,
	   "assigned_roles":[

	   ],
	   "viewCount":3,
	   "commentCount":1,
	   "thumbnail":"repoman/68ddc470-9ebe-4520-9d91-a35da65cc610/issues/d7090f40-5a78-11e7-b7f1-2968aca83c11/thumbnail.png",
	   "norm":[

	   ],
	   "position":[

	   ],
	   "viewpoint":{
	      "near":93.22692108154297,
	      "far":46613.4609375,
	      "fov":1.0471975803375244,
	      "aspect_ratio":1.4831358194351196,
	      "guid":"ce12a2a9-6f0e-4a37-aa87-3ddd52307fe0",
	      "_id":"595115361a1e367c590de068",
	      "type":"perspective",
	      "screenshot":"repoman/68ddc470-9ebe-4520-9d91-a35da65cc610/issues/d7090f40-5a78-11e7-b7f1-2968aca83c11/viewpoints/ce12a2a9-6f0e-4a37-aa87-3ddd52307fe0/screenshot.png",
	      "clippingPlanes":[

	      ],
	      "right":[
	         -0.5469865798950195,
	         0,
	         0.8371413350105286
	      ],
	      "view_dir":[
	         0.6944281458854675,
	         -0.5584722757339478,
	         0.45373809337615967
	      ],
	      "look_at":[
	         8159.1533203125,
	         3831.880859375,
	         -9764.24609375
	      ],
	      "position":[
	         -14553.9365234375,
	         22098.177734375,
	         -24604.9375
	      ],
	      "up":[
	         0.46752026677131653,
	         0.8295232057571411,
	         0.3054768741130829
	      ],
	      "screenshotSmall":"repoman/68ddc470-9ebe-4520-9d91-a35da65cc610/issues/d7090f40-5a78-11e7-b7f1-2968aca83c11/viewpoints/ce12a2a9-6f0e-4a37-aa87-3ddd52307fe0/screenshotSmall.png"
	   },
	   "typePrefix":"Architectural",
	   "modelCode":"LEGO",
	   "account":"repoman",
	   "model":"68ddc470-9ebe-4520-9d91-a35da65cc610"
	}
]
```

## Create an issue

### POST /{accountName}/{modelId}/issues.json
### POST /{accountName}/{modelId}/revision/{revId}/issues.json

Request body

[Issue object](#issue-object)

> Example request

```http
POST /repoman/611fc1ed-017b-4fc0-bdd5-ed40077756c3/issues.json HTTP/1.1
```
```json
{
	"name": "Door problem",
	"viewpoint": {
		"right": [
			-0.9527981281280518,
			0,
			0.3036045432090759
		],
		"up": [
			0.06726189702749252,
			0.9751502871513367,
			0.2110871523618698
		],
		"position": [
			-7.6559953689575195,
			11.788660049438477,
			-27.145030975341797
		],
		"look_at": [
			0.9664306640625,
			5.336418628692627,
			-0.08538341522216797
		],
		"view_dir": [
			0.2960600256919861,
			-0.22154445946216583,
			0.9291213750839233
		],
		"near": 0.09187718480825424,
		"far": 45.93859100341797,
		"fov": 1.0471975803375244,
		"aspect_ratio": 3.2890071868896484,
		"clippingPlanes": [],
		"screenshot": "base 64 encoded png"
	},
	"creator_role": "MEP Engineer",
	"pickedPos": [
		-7.628292560577393,
		1.0100265741348267,
		-3.308213233947754
	],
	"pickedNorm": [
		0,
		0,
		0
	],
	"scale": 1,
	"assigned_roles": [
		"Structural Engineer"
	],
	"priority": "none",
	"status": "open",
	"topic_type": "for_information",
	"desc": "XYZ",
	"rev_id": null,
	"position": [
		-7.628292560577393,
		1.0100265741348267,
		-3.308213233947754
	],
	"norm": [
		0,
		0,
		0
	],
	"group_id": "2229f920-68a8-11e7-84d9-5740a79c553d"
}
```

## Update an issue status

### PUT /{accountName}/{modelId}/issues/{issueId}.json
### PUT /{accountName}/{modelId}/revision/{revId}/issues/{issueId}.json

On updating issue status, the system will create an automated comment stating what the user has changed.

> Example request

```http
PUT /repoman/00000000-0000-0000-0000-000000000000/revision/00000000-0000-0000-0000-000000000000/issues/00000000-0000-0000-0000-000000000000.json HTTP/1.1
````
```json
{
	"priority": "medium",
	"status": "for approval",
	"topic_type": "for_information",
	"assigned_roles": [
		"Structural Engineer"
	],
	"desc": "new desc"
}
```

## Create a comment

### PUT /{accountName}/{modelId}/issues/{issueId}.json
### PUT /{accountName}/{modelId}/revision/{revId}/issues/{issueId}.json

Create a comment in an issue


> Example request

```http
PUT /repoman/00000000-0000-0000-0000-000000000000/revision/00000000-0000-0000-0000-000000000000/issues/00000000-0000-0000-0000-000000000000.json HTTP/1.1
````
```json
{
	"comment": "solved!",
	"viewpoint": {
		"right": [
			-0.9527981281280518,
			-7.450580596923828e-9,
			0.3036045432090759
		],
		"up": [
			0.06726188957691193,
			0.9751502871513367,
			0.2110871523618698
		],
		"position": [
			-7.6559953689575195,
			11.788660049438477,
			-27.145030975341797
		],
		"look_at": [
			0.9664306640625,
			5.336418628692627,
			-0.08538341522216797
		],
		"view_dir": [
			0.2960600256919861,
			-0.22154445946216583,
			0.9291213750839233
		],
		"near": 0.09187718480825424,
		"far": 45.93859100341797,
		"fov": 1.0471975803375244,
		"aspect_ratio": 3.7934560775756836,
		"clippingPlanes": [],
		"screenshot": "base 64 encoded png"
	}
}
```

## Update a comment

### PUT /{accountName}/{modelId}/issues/{issueId}.json
### PUT /{accountName}/{modelId}/revision/{revId}/issues/{issueId}.json

Update a comment, commenIndex start from 0.

> Example request

```http
PUT /repoman/00000000-0000-0000-0000-000000000000/revision/00000000-0000-0000-0000-000000000000/issues/00000000-0000-0000-0000-000000000000.json HTTP/1.1
````

```json
{
	"comment": "abcdefg",
	"edit": true,
	"commentIndex": 1
}
```

## Delete a comment

### PUT /{accountName}/{modelId}/issues/{issueId}.json
### PUT /{accountName}/{modelId}/revision/{revId}/issues/{issueId}.json

Deleta a comment, commenIndex start from 0.

> Example request

```http
PUT /repoman/00000000-0000-0000-0000-000000000000/revision/00000000-0000-0000-0000-000000000000/issues/00000000-0000-0000-0000-000000000000.json HTTP/1.1
````

```json
{
	"comment": "",
	"delete": true,
	"commentIndex": 1
}
```

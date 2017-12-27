# Model

## Get Model Settings

> Example request

```http
GET /repoman/00000000-0000-0000-0000-000000000000.json HTTP/1.1
```

> Example response

```json
{
	"owner": "repoman",
	"desc": "",
	"type": "sample",
	"permissions": [
		"upload_files",
		"create_issue",
		"comment_issue",
		"view_issue",
		"view_model",
		"download_model",
		"edit_federation"
	],
	"properties": {
		"topicTypes": [
			{
				"label": "For information",
				"value": "for_information"
			},
			{
				"label": "VR",
				"value": "vr"
			}
		]
	},
	"status": "ok",
	"subModels": [],
	"headRevisions": {
		"master": "abf8f711-3756-4dd3-b50f-21db7859042c"
	}
}
```

### GET /{accountName}/{modelId}.json

Get model information

Response body

Attribute       | Description
--------------- | ----------------------------------------------------
owner |
desc |
type | model type
permissions | list of [model level permissions](#model-level)
properties | [model propertie object](#model-propertie-object)
status | model upload status. ok, processing, failed
errorReason |  error reason if status is failed
subModels | list of sub models, empty for non-federated model
headRevisions | id of head of all branches
federate | true if model is a federate

### model propertie object
Attribute       | Description
--------------- | ----------------------------------------------------
pinSize |
avatarHeight |
visibilityLimit |
speed |
zNear |
zFar |
unit | cm, m, ft, mm
mapTile | [map tile object](#map-tile-object), solely used for OS map plugin
code | a short code represents this model, contains only numbers and alphabets, no longer than 5 characters
topicTypes | [topic type object](#topic-type-object)

### map tile object
Attribute       | Description
--------------- | ----------------------------------------------------
lat | latitude
lon | longitude
y | y offset for the map tile

### topic type object
Attribute       | Description
--------------- | ----------------------------------------------------
value |
label |

## Update model settings

> Example request

```http
PUT /repoman/00000000-0000-0000-0000-000000000000/settings HTTP/1.1
```
```json
{
	"code": "012",
	"topicTypes": ["Type 1", "Type 2"],
	"pinSize" : 1,
	"avatarHeight": 1,
	"visibilityLimit": 1,
	"speed" : 1,
	"zNear" : 1,
	"zFar" : 1,
	"unit": "m"
	"mapTile": {
		"lat": 1,
		"lon": 1,
		"y": 1
	}
}
```

> Example response

```json
{
	"code": "012",
	"topicTypes": [
		{ "value": "type_1", "label": "Type 1"},
		{ "value": "type_2", "label": "Type 2"}
	],
	"pinSize" : 1,
	"avatarHeight": 1,
	"visibilityLimit": 1,
	"speed" : 1,
	"zNear" : 1,
	"zFar" : 1,
	"unit": "m"
	"mapTile": {
		"lat": 1,
		"lon": 1,
		"y": 1
	}
}
```

### PUT /{accountName}/{modelId}/settings

Update model settings.

Request body
[model propertie object](#model-propertie-object)

## Create a model

> Example request

```http
POST /repoman/model1 HTTP/1.1
```
```json
{
	"desc": "this is a model",
	"type": "Structural",
	"code": "00123",
	"unit": "m",
	"subModels": [{
		"database": "repoman",
		"model": "00000000-0000-0000-0000-000000000001"
	}],
	"project": "project1"

}
```

> Example response

```json
{
    "account":"repoman",
    "model":"00000000-0000-0000-0000-000000000000",
    "name": "model1",
    "permissions":[
        "change_model_settings",
        "upload_files",
        "create_issue",
        "comment_issue",
        "view_issue",
        "view_model",
        "download_model",
        "edit_federation",
        "delete_federation",
        "delete_model",
        "manage_model_permission"
    ]
}
```

### POST /{accountName}/{modelName} 

Create a new model.

URL parameters

Parameter | Required | Description
--------- | ------- | -------
modelName | Yes | the new model name

Request body

Attribute       | Required | Description
--------------- | ---------| ----------------------------------------------------
desc | No | description
type | No | model type
subModels | No | list of sub models, empty for non-federated model
unit | Yes | cm, m, ft, mm
code |  No | a short code represents this model, contains only numbers and alphabets, no longer than 5 characters
project |  No | project this model belongs to


## Edit a federation

> Example request

```http
PUT /repoman/00000000-0000-0000-0000-000000000000 HTTP/1.1
```
```json
{ "subModels" : 
	[
		{
			"database": "repoman",
			"model": "00000000-0000-0000-0000-000000000001"
		}
	]
}
```

> Example response

```json
{
	"account": "repoman"
	"model": "00000000-0000-0000-0000-000000000000"
}
```

### PUT /{accountName}/{modelID}

This API is used to update sub models in a federated model only.

Calling this API with a  non-federated model will return an error. To update model settings, see [Update model settings](#update-model-settings)

Request body

Attribute       | Required | Description
--------------- | ---------| ----------------------------------------------------
subModels | Yes | list of [sub model objects](#sub-model-object)

### Sub model object
Attribute       | Description
--------------- | --------------------------------------------------------
database  | account name the model belongs to
model   | model name

## Upload a model

> Example request

```http
POST /repoman/00000000-0000-0000-0000-000000000000/upload HTTP/1.1
Content-Type: multipart/form-data; boundary=----WebKitFormBoundarySos0xligf1T8Sy8I

------WebKitFormBoundarySos0xligf1T8Sy8I
Content-Disposition: form-data; name="file"; filename="3DrepoBIM.obj"
Content-Type: application/octet-stream

<binary content>
------WebKitFormBoundarySos0xligf1T8Sy8I
Content-Disposition: form-data; name="tag"

rev1
------WebKitFormBoundarySos0xligf1T8Sy8I
Content-Disposition: form-data; name="desc"

el paso
------WebKitFormBoundarySos0xligf1T8Sy8I--
```

> Example response

```json
{"status":"uploaded"}
```

### POST /{accountName}/{modelID}/upload

Upload a model. Only multipart/form-data content type will be accepted.

Request body

Attribute       | Required | Description
--------------- | ---------| ----------------------------------------------------
file | Yes | the model to be uploaded
tag | No | revision name
desc | No | revision description


## Download a model

> Example request

```http
GET /repoman/00000000-0000-0000-0000-000000000000/download/latest HTTP/1.1
```

> Example response

```http
HTTP/1.1 200 OK
Content-Length: 671606
Content-Disposition: attachment;filename=Tevolys.ifc
Content-Type: binary/octet-stream

<binary content>
```

### GET /{accountName/{modelID}/download/latest

Download model of latest revision

## Delete a model

> Example request

```http
DELETE /repoman/00000000-0000-0000-0000-000000000000 HTTP/1.1
```

> Example response

```json
{
	"account": "repoman",
	"model": "00000000-0000-0000-0000-000000000000"
}

```

### DELETE /{accountName}/{modelID}

Delete a model.

## Get model permissions

> Example request

```http
GET /repoman/00000000-0000-0000-0000-000000000000/permissions HTTP/1.1
```

> Example response

```json
[
	{
		"user": "breakingbad",
		"permission": "viewer"
	}
]
```

### GET /{accountName}/{modelID}/permissions

Get list of permissions of this model assigned to users.

Response body

List of [model permission objects](#model-permission)

### Model permission
Attribute       | Description
--------------- | ----------------------------------------------------
user            |
permission      | ID of [a permission template](#permission-template)

## Update model permission

> Example request

```http
POST /repoman/00000000-0000-0000-0000-000000000000/permissions HTTP/1.1
```
```json
[
	{
		"user": "breakingbad",
		"permission": "customA"
	},
	{
		"user": "mrwhite",
		"permission": "viewer"
	}
]
```

> Example response

```json
[
	{
		"user": "breakingbad",
		"permission": "customA"
	},
	{
		"user": "mrwhite",
		"permission": "viewer"
	}
]
```

### POST /{accountName}/{modelID}/permissions

Update permissions assigned users for this model.

Request body

List of [model permission objects](#model-permission)

<aside class="notice">
The API replaces the whole array object with the request body, which means
to remove a permission assigned to a user, just supply a new array without
that particular model permission object.
</aside>


## Get all jobs

### GET /{accountName}/{modelID}/jobs.json

Same as [Get all jobs](#get-all-jobs) for an account.

This API is created to get around the problem that some users may not
have access to the [Get all jobs](#get-all-jobs) for an account API.

## Get user job

> Example request 

```http
GET /repoman/00000000-0000-0000-0000-000000000000/userJobForModel HTTP/1.1
```

>Example response

```json
{"_id":"Actor", "color": "#000000"}
```
### GET /{accountName}/{modelID}/userJobForModel.json

Get the job assigned to user for this team space

Response body

[Job object](#job-object)


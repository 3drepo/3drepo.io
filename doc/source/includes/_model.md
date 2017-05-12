# Model

## Get a model

> Example request

```http
GET /repoman/model1.json HTTP/1.1
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
	"subProjects": [],
	"headRevisions": {
		"master": "abf8f711-3756-4dd3-b50f-21db7859042c"
	}
}
```

### GET /{accountName}/{modelName}.json

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
subProjects | list of sub models, empty for non-federated model
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
code | a short code represents this model
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

## Create a model

## Update a model

## Upload a model

## Download a model

## Delete a model

## Get model permissions

## Update model permissions

## Get all jobs

## Get user jobs

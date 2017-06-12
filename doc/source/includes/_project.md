# Project
Project is basically a group of models, with [project level permissions](#project-level) attached to it.

You can assign a model to a project when creating the model.

## Project object

Attribute | Description
--------- | -------
_id   |
name  | project name
models | list of models belong to this project
permissions | list of [project permission objects](#project-permission-object)

### Project permission object

Attribute | Description
--------- | -------
user |
permissions | list of [project level permissions](#project-level)


## Create a project

> Example request

```http
POST /repoman/projects HTTP/1.1
```
```json
{
	"name": "project1"
}
```
> Example response

```json
{
	"_id": "5915b8f0053405116b20c75a"
	"name": "project1",
	"models": [],
	"permissions": []
}
```

### POST /{accountName}/projects

Create a project

### Request body

Attribute | Required | Description
--------- | ------- | -------
name | Yes | project name

## Update a project

```http
PUT /repoman/projects/project1 HTTP/1.1
```
```json
{
	"name": "project2",
	"permissions": [
		{
			"name": "breakingbad",
			"permissions": ["create_model"]
		}
	]
}
```
> Example response

```json
{
	"_id": "5915b8f0053405116b20c75a",
	"name": "project2",
	"models": [],
	"permissions": [
		{
			"name": "breakingbad",
			"permissions": ["create_model"]
		}
	]
}
```

### PUT /{accountName}/projects/{projectName}

Update a project.

Request body

Attribute | Required | Description
--------- | ------- | -------
name | No | new project name
permissions | No | list of [project permission objects](#project-permission-object)

## Delete a project

> Example request

```http
DELETE /repoman/projects/project1 HTTP/1.1
```

> Example response

```json
{}
```

### DELETE /{accountName}/projects/{projectName}

Delete a project

### URL parameters

Parameter | Required | Description
--------- | ------- | -------
projectName | Yes | project to be deleted
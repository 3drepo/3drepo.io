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


## Get projects

```http
GET /repoman/projects HTTP/1.1
```
> Example response

```json
[
    {
        "_id": "5943d7346d826657ecc3877f",
        "name": "project1",
        "__v": 13,
        "permissions": [
            {
                "user": "projectuser",
                "permissions": [
                    "create_model"
                ]
            },
            {
                "user": "projectuser2",
                "permissions": [
                    "create_federation"
                ]
            },
            {
                "user": "projectuser3",
                "permissions": [
                    "admin_project"
                ]
            },
            {
                "user": "projectuser4",
                "permissions": [
                    "edit_project"
                ]
            },
            {
                "user": "projectuser5",
                "permissions": [
                    "delete_project"
                ]
            }
        ],
        "models": [
            "18ea3858-b2df-4260-a6ed-38ef407dc39e"
        ]
    },
    {
        "_id": "5948e5c591d9661fd6048217",
        "name": "project2",
        "__v": 0,
        "permissions": [],
        "models": []
    }
]
```
### GET /{accountName}/projects

Get all projects in a teamsapce, returns a list of [project objects](#project-object)

## Get a project

```http
GET /repoman/projects/project2 HTTP/1.1
```
> Example response

```json
{
    "_id": "5948e5c591d9661fd6048217",
    "name": "project2",
    "__v": 0,
    "permissions": [],
    "models": []
}
```

### GET /{accountName}/projects/{projectName}

Get a project specified by teamspace and project name, returns a [project objects](#project-object)

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
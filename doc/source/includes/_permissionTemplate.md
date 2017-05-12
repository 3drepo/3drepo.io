# Permission template

## Template object
Attribute | Required | Description
--------- | ------- | -------
_id | Yes | template name
permissions | Yes | list of [model level permissions](#model-level)


## Get all templates

> Example request

```http
GET /repoman/permission-templates HTTP/1.1
```

> Example response

```json
[
	{
		"_id": "template1",
		"permissions": ["view_model"]
	},
	{
		"_id": "template2",
		"permissions": ["view_model", "view_issue"]
	}
]
```

### GET /{accountName}/permission-templates

Get a list of [permission templates](#template-object) belongs to this account.

## Create a template

> Example request

```http
POST /repoman/permission-templates HTTP/1.1
```
```json
{
	"_id": "template1",
	"permissions": ["view_model"]
}
```

> Example response

```json
{
	"_id": "template1",
	"permissions": ["view_model"]
}
```

### GET /{accountName}/permission-templates

Create a permission template.

Request body

[Template object](#template-object)

## Delete a template

> Example request

```http
DELETE /repoman/permission-templates/template1 HTTP/1.1
```

> Example response

```json
{}
```

### DELETE /{accountName}/permission-templates/{templateId}

Delete a permission template

### URL parameters

Parameter | Required | Description
--------- | ------- | -------
templateId | Yes | template ID to be deleted
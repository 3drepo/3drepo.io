# Account permission

## Account permission object
Attribute          | Description
------------------ | ------- 
user               | 
permissions        | list of [account level permissions](#account-level)

## Get permission

> Example request

```http
GET /repoman/permissions HTTP/1.1
```

> Example response

```json
[
	{
		"user": "breakingbad",
		"permissions": ["create_project"]
	}
]
```

### GET /{acconutName}/permissions

Get a list of [account permission objects](#account-permission-object) on this account.


## Assign permissions

> Example request

```http
POST /repoman/permissions HTTP/1.1
```


```json
{
	"user": "breakingbad",
	"permissions": ["create_project"]
}
```

> Example response

```json
[{
	"user": "breakingbad",
	"permissions": ["create_project"]
}]
```

### POST /{accountName}/permissions

Assign account level permission to a user.

### Request body
[account permission object](#account-permission-object)


## Update permissions

> Example request

```http
PUT /repoman/permissions/breakingbad HTTP/1.1
```
```json
{ "permissions": ["teamspace_admin"] }
```

> Example response

```json
{ "permissions": ["teamspace_admin"] }
```

### PUT /{accountName}/permissions/{user}

Update permission assigment on a user

Request body

Attribute          | Description
------------------ | ------- 
permissions        | list of [account level permissions](#account-level)

## Revoke permissions

> Example request

```http
DELETE /repoman/permissions/breakingbad HTTP/1.1
```

> Example response

```json
{}
```

### DELETE /{accountName}/permissions/{user}

Revoke all permissions from a user.


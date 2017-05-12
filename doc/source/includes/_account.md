# Account

## Sign up
> Example Request

```http
POST /repoman HTTP/1.1
```


```json
{
	"email": "repo-man@3drepo.org",
	"password": "1984fantasy",
	"firstName": "Otto",
	"lastName": "Maddox",
	"company": "Universal Pictures",
	"countryCode": "US",
	"jobTitle": "Punk Rocker",
	"phoneNo": "12345678",
	"captcha": "1234567890qwertyuiop"


}
```
> Example Responses

```json
{
	"username": "repoman"
}
```


### POST /{accountName}

Sign up a new account.

### URL parameters

Parameter | Required | Format
--------- | ------- | -------
accountName | Yes | only alphabets and numbers and starts with an alphabet, less than 20 characters

### Request body

Attribute | Required | Format
--------- | ------- | -------
password | Yes | 
email | Yes | valid email address
firstName | No
lastName | No
company | No
jobTitle | No
countryCode | No | ISO 3166-1 alpha-2
captcha | *Yes | Google reCAPTCHA response token

\* Depends on server config file

## Verify

> Example Request

```http
POST /repoman/verify HTTP/1.1
```
```json
{ "token": "1234567890" }
```


> Example Response

```json
{ "account": "repoman" }
```

### POST /{accountName}/verify

Verify an account after signing up


Attribute | Required 
--------- | ------- 
token | Yes 


## List info

> Example Request

```http
GET /repoman.json HTTP/1.1
```

> Example Response

```json
{
	"accounts": [
		{
			"account": "repoman",
			"projects": [
				{
					"permissions": [
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
					],
					"project": "ufo",
					"status": "ok",
					"timestamp": "2016-07-26T15:52:11.000Z"
				}
			],
			"fedProjects": [],
			"isAdmin": true,
			"permissions": [
				"teamspace_admin"
			],
			"quota": {
				"spaceLimit": 10485760,
				"collaboratorLimit": 5,
				"spaceUsed": 12478764
			},
			"projectGroups": []
		},
		{
			"account": "breakingbad",
			"projects": [
				{
					"permissions": [
						"view_issue",
						"view_model",
						"upload_files",
						"create_issue"
					],
					"project": "homelab",
					"status": "ok",
					"timestamp": null
				}
			],
			"fedProjects": [
				{
					"federate": true,
					"permissions": [
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
					],
					"project": "fed1",
					"status": "ok",
					"timestamp": "2017-05-11T12:49:59.000Z",
					"subProjects": [
						{
							"database": "breakingbad",
							"project": "homelab"
						},
						{
							"database": "breakingbad",
							"project": "laundrylab"
						}
					]
				}
			],
			"projectGroups": [
				{
					"_id": "58f78c8ededbb13a982114ee",
					"name": "folder1",
					"permission": [],
					"models": [
						{
							"permissions": [
								"view_issue",
								"view_model",
								"upload_files",
								"create_issue"
							],
							"project": "laundrylab",
							"status": "ok",
							"timestamp": null
						}
					]
				}
			]
		}
	],
	"email": "test3drepo@mailinator.com",
	"billingInfo": {
		"countryCode": "US",
		"postalCode": "0",
		"line2": "123",
		"city": "123",
		"line1": "123",
		"vat": "000",
		"company": "Universal Pictures",
		"lastName": "Maddox",
		"firstName": "Otto",
		"_id": "59145aedf4f613668fba0f98"
	},
	"hasAvatar": true,
	"jobs": [
		{
			"_id": "Director"
		},
		{
			"_id": "Actor"
		},
		{
			"_id": "Producer"
		}
	]
}
```

### GET /{accountName}.json

Return list of projects group by account this account have access to and account information.

### Return body

Attribute |  Format | Description
--------- | ------- | ---------------
accounts | | list of account object
email | | 
billingInfo ||
hasAvatar | boolean | whether the account has an avatar
jobs | | list of [job objects](#job-object)

### Account object

Attribute |  Format | Description
--------- | ------- | ---------------
account   | | account name
projects  | | list of [model objects](#model-object), listed here if they do not belongs to any project
fedProjects | | list of federated [model objects](#model-object) 
projectGroups | | list of [projects (folders) objects](#project-object-in-account-info)
isAdmin `deprecated` | | is user an account admin of this account
permissions | list of [account level permission](#account-level)  | list of permissions user has on this account
firstName ||
lastName ||
quota | [quota object](#quota-object) | 

### Quota object

Attribute           |  Description                  | Format
------------------- | ----------------------------- | ---------------
spaceLimit          | account space limit           | integer, size in byte
collaboratorLimit   | account collaborator limit    | integer, size in byte
spaceUsed           | account space limit           | integer, size in byte

### Project Object (in account info)
Attribute           |  Description                  
------------------- | ----------------------------- 
_id |
name | project name 
permissions | list of [project level permissions](#project-level)
models | list of [model objects](#model-object) belong to this project

### Model Object
Attribute           |  Description                                  | Format
------------------- | ----------------------------------------------|----------------------
project             |  model name                                   |
status              |  upload status                                | ok, processing, failed
timestamp           |  date last changed                            | ISO 8601
permissions         |  lise of [model level permissions](#model-level)      |
federate            |  is the model a federated model               | always true, attribute absent for non-federated project
subProjects         |  list of sub models if it is a federated model

## Get avatar

> Example Request

```http
GET /repoman/avatar HTTP/1.1
```

> Example Responses

```plaintext
<binary image>
```

### GET /{accountName}/avatar

Return avatar if user has one.


## Upload avatar

> Example Request

```http
POST /repoman/avatar HTTP/1.1
Content-Type: multipart/form-data; boundary=----WebKitFormBoundaryN8dwXAkcO1frCHLf

------WebKitFormBoundaryN8dwXAkcO1frCHLf
Content-Disposition: form-data; name="file"; filename="avatar.png"
Content-Type: image/png

<binary content>
------WebKitFormBoundaryN8dwXAkcO1frCHLf--

```

> Example Responses

```json
{
	"status":"success"
}
```

### POST /{accountName}/avatar

Upload an image. Only multipart form data content type will be accepted.

## Update account info

> Example request

```http
PUT /repoman HTTP/1.1
```
```json
{
	"firstName": "Heisenberg"
	"lastName": "White"
	"email": "heisenberg@3drepo.org"
}
```

> Example Response

```json
{
	"account":"repoman"
}
```

### PUT /{accountName}

Update account information.

### Request body

Attribute | Required | Format
--------- | ------- | -------
email | No | valid email address
firstName | No
lastName | No


## Reset password

> Example request

```http
PUT /repoman HTTP/1.1
```
```json
{
	"oldPassword": "1984fantasy",
	"newPassword": "ElPaso"
}
```



> Example Response

```json
{
	"account":"repoman"
}
```

### PUT /{accountName}

Reset password. New password must be different.

### Request body

Attribute | Required 
--------- | ------- 
oldPassword | Yes 
newPassword | Yes 



### PUT /{accountName}/password

Reset password by token.

Attribute | Required 
--------- | ------- 
token | Yes 
newPassword | Yes 


## Forgot password

> Example Request

```http
POST /repoman/forgot-password HTTP/1.1
```
```json
	{ "email": "repoman@3drepo.org"}
```

> Example response

```json
{}
```

### POST /{accountName}/forgot-password

### Request body

Send a reset password link to account's email.

Attribute | Required 
--------- | ------- 
email | Yes 




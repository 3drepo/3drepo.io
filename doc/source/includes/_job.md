# Job

## Job object

Attribute | Description
--------- | ------------------
_id       | job name
color     | job color, RGB hex values

## Get all jobs

> Example request

```http
GET /repoman/jobs HTTP/1.1
```

> Example response

```json
[
	{
		"_id": "chef",
		"color": "#000000"
	},
	{
		"_id": "distributor",
		"color": "#111111"
	}
]
```

### GET /{accountName}/jobs

Get a list of [job objects](#job-object) belongs to this account.

## Create a job

> Example request

```http
POST /repoman/jobs HTTP/1.1
```
```json
{
	"_id": "driver",
	"color": "#111111"
}
```

> Example response

```json
[
	{
		"_id": "driver",
		"color": "#111111"
	}
]
```

### POST /{accountName}/jobs

Create a job for this account

Request body
[Job object](#job-object)

## Delete a job

> Example request

```http
DELETE /repoman/jobs/driver HTTP/1.1
```
> Example response

```json
{}
```

### DELETE /{accountName}/jobs/{jobId}

Delete a job from an account

### URL parameters

Parameter | Required | Description
--------- | ------- | -------
jobId | Yes | job ID to be deleted
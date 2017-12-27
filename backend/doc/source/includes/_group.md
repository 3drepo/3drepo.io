# Group

Groups are a way to group a set of objects. Currently, it is mainly used by associating a group of objects to an issue.

## Add a Group

### POST /{accountName}/{modelID}/group
> Example request

```http
POST /repoman/00000000-0000-0000-0000-000000000000/groups HTTP/1.1
```
```json
{
   "color":[
      255,
      0,
      0
   ],
   "name":"My Test Group",
   "objects":[
      {
         "id":"b3011137-4f6f-4116-aada-78ac3a534237",
         "shared_id":"86c58eb3-035b-45e7-990d-e4a3321ce8f8"
      }
   ]
}
```

> Example response

```json
{
   "color":[
      255,
      0,
      0
   ],
   "_id":"4ssij3n7-4f6f-4116-awja-78a293843j37",
   "objects":[
      {
         "id":"b3011137-4f6f-4116-aada-78ac3a534237",
         "shared_id":"86c58eb3-035b-45e7-990d-e4a3321ce8f8"
      }
   ]
}
```

Add a Group to the model. This end point takes the follow parameters:

Attribute       | Required? | Description
--------------- | ----------|-----------------------------------------
color           |     Y     | RGB value for the highlighting colour of this group.
name            |     Y     | Name of the group
objects         |     Y     | Array of objects that are included in the group.

The server will respond with the same information, with the name replaced by an ID to represent this group.

## List all groups

### GET /{accountName}/{modelID}/groups
> Example request

```http
GET /repoman/00000000-0000-0000-0000-000000000000/groups HTTP/1.1
```

> Example response

```json
[
   {
      "_id":"55ffc510-e015-11e7-b944-052a1c989ca1",
      "issue_id":"562e2810-e015-11e7-b944-052a1c989ca1",
      "color":[
         255,
         0,
         0
      ],
      "objects":[
         {
            "shared_id":"df429cab-735e-4f38-ab93-b857ec3961e9",
            "account":"carmen",
            "model":"25d063ae-b0fc-473b-a472-3e3405944f29"
         },
         {
            "shared_id":"0cbe281f-f393-42f9-9d51-99e899d2d9ba",
            "account":"carmen",
            "model":"25d063ae-b0fc-473b-a472-3e3405944f29"
         }
      ]
   }
]
```

List all groups associated with the model.

### Group Object

Attribute       | Description
--------------- |-----------------------------------------
_id             | ID of this group
issue_id        | ID of issue that this group is created for (only appears if the group was created by an issue
color           |  RGB value for the highlighting colour of this group.
objects         | Array of objects that are included in the group.

The server will respond with the same information, with the name replaced by an ID to represent this group.

## Find a Group
### GET /{accountName}/{modelID}/groups/{groupID}
> Example request

```http
GET /repoman/00000000-0000-0000-0000-000000000000/groups/55ffc510-e015-11e7-b944-052a1c989ca1 HTTP/1.1
```

> Example response

```json
   {
      "_id":"55ffc510-e015-11e7-b944-052a1c989ca1",
      "issue_id":"562e2810-e015-11e7-b944-052a1c989ca1",
      "color":[
         255,
         0,
         0
      ],
      "objects":[
         {
            "shared_id":"df429cab-735e-4f38-ab93-b857ec3961e9",
            "account":"carmen",
            "model":"25d063ae-b0fc-473b-a472-3e3405944f29"
         },
         {
            "shared_id":"0cbe281f-f393-42f9-9d51-99e899d2d9ba",
            "account":"carmen",
            "model":"25d063ae-b0fc-473b-a472-3e3405944f29"
         }
      ]
   }
```

Get [Group info](#group-object) of a particular group given it's ID. 

## Update a Group
### PUT /{accountName}/{modelID}/groups/{groupID}
> Example request

```http
PUT /repoman/00000000-0000-0000-0000-000000000000/groups/55ffc510-e015-11e7-b944-052a1c989ca1 HTTP/1.1
```

```json
   {
      "_id":"55ffc510-e015-11e7-b944-052a1c989ca1",
      "issue_id":"562e2810-e015-11e7-b944-052a1c989ca1",
      "color":[
         255,
         0,
         0
      ],
      "objects":[
         {
            "shared_id":"0cbe281f-f393-42f9-9d51-99e899d2d9ba",
            "account":"carmen",
            "model":"25d063ae-b0fc-473b-a472-3e3405944f29"
         }
      ]
   }
```

> Example response

```json
   {
      "_id":"55ffc510-e015-11e7-b944-052a1c989ca1",
      "issue_id":"562e2810-e015-11e7-b944-052a1c989ca1",
      "color":[
         255,
         0,
         0
      ],
      "objects":[
         {
            "shared_id":"0cbe281f-f393-42f9-9d51-99e899d2d9ba",
            "account":"carmen",
            "model":"25d063ae-b0fc-473b-a472-3e3405944f29"
         }
      ]
   }
```

Update [Group info](#group-object) of a particular group given it's ID. 

## Delete a Group
### DELETE /{accountName}/{modelID}/groups/{groupID}
> Example request

```http
DELETE /repoman/00000000-0000-0000-0000-000000000000/groups/55ffc510-e015-11e7-b944-052a1c989ca1 HTTP/1.1
```

> Example response

```json
   {
      "status": "success"
   }
```

Delete a particular group given it's ID. 


# Model History
## List all revisions

### GET /{accountName}/{modelID}/revisions.json

> Example request 

```http
GET /repoman/00000000-0000-0000-0000-000000000000/revisions.json HTTP/1.1
```

>Example response

```json
[
   {
      "_id":"818ecfd3-b6d6-4505-a2b0-93dc1ad12397",
      "author":"carmen",
      "timestamp":"2017-02-13T10:45:05.000Z",
      "name":"818ecfd3-b6d6-4505-a2b0-93dc1ad12397",
      "branch":"master"
   }
]
```

Get all revisions within this model.


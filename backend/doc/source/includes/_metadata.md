# Metadata
## Get Metadata By ID
### GET /{accountName}/{modelID}/meta/{id}.json

> Example request 

```http
GET /repoman/00000000-0000-0000-0000-000000000000/meta/83aca55d-c7d5-4885-8913-213c86385685.json HTTP/1.1
```

>Example response

```json
{
   "meta":[
      {
         "_id":"83aca55d-c7d5-4885-8913-213c86385685",
         "name":"M_K-Series Bar Joist-Rod Web:14K1:14K1:190265",
         "metadata":{
            "IFC Type":"IfcBeam",
            "IFC GUID":"2Uhw1he2z3UO$DBmBugLv0",
            "Work Plane":"Level : Roof - Main",
            "Reference Level":"Roof - Main",
            "Start Level Offset":0,
            "End Level Offset":0,
            "z-Direction Justification":3,
            "z-Direction Offset Value":0,
            "Lateral Justification":0,
            "Orientation":0,
            "Cross-Section Rotation":0,
            "Length":8.57,
            "Volume":0.012045,
            "Cut Length":8.57,
            "Structural Usage":4,
            "Phase Created":"New Construction",
            "Rigid Links":0,
            "Horizontal Projection":"Default",
            "Reference":"Reference",
            "IsExternal":"False",
            "LoadBearing":"True",
            "Span":0.0095,
            "Slope":0
         }
      }
   ]
}
```
Given a metadata ID, retrieve the metadata info. Metadata IDs can be found within associated [Tree Nodes](#tree-node). 

## Find Objects with...
### GET /{accountName}/{modelID}/revision/master/head/meta/findObjectsWith/{metaKey}.json
### GET /{accountName}/{modelID}/revision/{revID}/meta/findObjectsWith/{metaKey}.json

> Example request 

```http
GET /repoman/00000000-0000-0000-0000-000000000000/revision/master/head/meta/findObjsWith/IFC Type.json HTTP/1.1
```

>Example response

```json
{
   "data":[
      {
         "_id":"0024c613-0012-4353-93b5-1714e6aa0c56",
         "metadata":{
            "value":"IfcFooting"
         },
         "parents":[
            "651d457a-c510-4cd7-9955-a0b015e76dcb"
         ]
      },
      {
         "_id":"003ba24c-967e-408a-9c2f-51459dca7c19",
         "metadata":{
            "value":"IfcBeam"
         },
         "parents":[
            "954d6bf9-31bb-435c-9a26-017920743e12"
         ]
      },
      {
         "_id":"00e75c1d-5a66-4a46-9912-fe30fc56089f",
         "metadata":{
            "value":"IfcBeam"
         },
         "parents":[
            "46bf6928-d124-40d6-946e-b241825c46c3"
         ]
      },
      {
         "_id":"014f271d-dbd2-4e03-8d96-9b23fda84dae",
         "metadata":{
            "value":"IfcBeam"
         },
         "parents":[
            "55cb20c1-662f-4178-bfd1-6d7046932e31"
         ]
      },
      {
         "_id":"0199482c-7370-4513-b97e-0db265af661c",
         "metadata":{
            "value":"IfcWallStandardCase"
         },
         "parents":[
            "513e2028-e507-49ef-99a9-24af1021d994"
         ]
      }
   ]
}
```
Search the model for any metadata with the property {metaKey}. This returns it's value and also [tree nodes](#tree-node) associated with the metadata.

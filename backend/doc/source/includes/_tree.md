#Tree

## Model Tree
### GET /{accountName}/{modelID}/revision/master/head/fulltree.json
> Example request

```http
GET /repoman/00000000-0000-0000-0000-000000000000/revision/Version_22/fulltree.json HTTP/1.1
```

> Example response

```json
{"mainTree": 
	{"nodes":
		{
			"account":"username",
			"project":"3664beb0-2343-4ff3-b653-13a63d407bd3",
			"type":"transformation",
			"name":"cube.obj",
			"path":"bed002e0-55a8-40b3-b97c-1b94a533aade",
			"_id":"bed002e0-55a8-40b3-b97c-1b94a533aade",
			"shared_id":"e05e4e1a-cba6-421f-9f7a-69a1caf81807",
			"toggleState":"visible",
			"meta": ["fdt002e0-55a8-40b3-b97c-1j3256jklade"],
			"children":[
				{
					"account":"username",
					"project":"3664beb0-2343-4ff3-b653-13a63d407bd3",
					"type":"mesh",
					"name":"g default",
					"path":"bed002e0-55a8-40b3-b97c-1b94a533aade__b3011137-4f6f-4116-aada-78ac3a534237",
					"_id":"b3011137-4f6f-4116-aada-78ac3a534237",
					"shared_id":"86c58eb3-035b-45e7-990d-e4a3321ce8f8",
					"toggleState":"visible"
				}]
	},
	"idToName":{"bed002e0-55a8-40b3-b97c-1b94a533aade":"cube.obj","b3011137-4f6f-4116-aada-78ac3a534237":"g default"}
	},
 "subTrees":[]
}
```
### GET /{accountName}/{modelID}/revision/{revision}/fulltree.json

Fetch model tree. use master/head to get the tree for the latest model, otherwise, specify the revision ID or revision tag.

This returns a json with various data:
### Tree Structure
Attribute       | Description
--------------- | ----------------------------------------------------
mainTree        | contains the main tree structure, and an id to name mapping for each node
subTrees        | urls to subtree (federation only)

### Tree Node
Attribute       | Description
--------------- | ----------------------------------------------------
account         | teamspace this node belongs to
project         | modelID this node belongs to
type            | type of node this is (transformation, mesh or ref)
name            | name of the node
path            | path to get to this node
_id             | unique ID of this node
shared_id       | shared ID of this node
toggleState     | default visibility state of this node (IFC Space are hidden by default)
meta            | array of metadata ID associated with this node
children        | array of children nodes 

## Tree Path

### GET /{accountName}/{modelID}/revision/master/head/tree_path.json
> Example request

```http
GET /repoman/00000000-0000-0000-0000-000000000000/revision/Version_22/tree_path.json HTTP/1.1
```

> Example response

```json
{"treePaths":
	{"idToPath":{
		"bed002e0-55a8-40b3-b97c-1b94a533aade":"bed002e0-55a8-40b3-b97c-1b94a533aade",
		"b3011137-4f6f-4116-aada-78ac3a534237":"bed002e0-55a8-40b3-b97c-1b94a533aade__b3011137-4f6f-4116-aada-78ac3a534237"
	}}
}
```
### GET /{accountName}/{modelID}/revision/{revision}/tree_path.json

Retrieve the full mapping of unique ID of nodes to the path that is required to tranverse into the node within the [model tree](#model-tree).

## Shared ID mapping

### GET /{accountName}/{modelID}/revision/master/head/idMap.json
> Example request

```http
GET /repoman/00000000-0000-0000-0000-000000000000/revision/Version_22/idMap.json HTTP/1.1
```

> Example response

```json
{
	"idMap":{
		"b3011137-4f6f-4116-aada-78ac3a534237":"86c58eb3-035b-45e7-990d-e4a3321ce8f8",
		"bed002e0-55a8-40b3-b97c-1b94a533aade":"e05e4e1a-cba6-421f-9f7a-69a1caf81807"
	}
}
```
### GET /{accountName}/{modelID}/revision/{revision}/idMap.json

Retrieve the full mapping of unique ID to shared ID of the nodes within the [model tree](#model-tree).


## ID to meshes

### GET /{accountName}/{modelID}/revision/master/head/idToMeshes.json
> Example request

```http
GET /repoman/00000000-0000-0000-0000-000000000000/revision/Version_22/idToMeshes.json HTTP/1.1
```

> Example response

```json
{
   "idToMeshes":{
      "b3011137-4f6f-4116-aada-78ac3a534237":[
         "b3011137-4f6f-4116-aada-78ac3a534237"
      ],
      "bed002e0-55a8-40b3-b97c-1b94a533aade":[
         "b3011137-4f6f-4116-aada-78ac3a534237"
      ]
   }
}
```
### GET /{accountName}/{modelID}/revision/{revision}/idToMeshes.json

Retrieve the full mapping of unique ID to the IDs of meshes this node is associated with.

## Get All meshes

### GET /{accountName}/{modelID}/revision/master/head/meshes.json
> Example request

```http
GET /repoman/00000000-0000-0000-0000-000000000000/revision/Version_22/meshes.json HTTP/1.1
```

> Example response

```json
{"meshes":[{"_id":"b3011137-4f6f-4116-aada-78ac3a534237","shared_id":"86c58eb3-035b-45e7-990d-e4a3321ce8f8"}]}
```
### GET /{accountName}/{modelID}/revision/{revision}/meshes.json

Retrieve the IDs of all meshes within the model.



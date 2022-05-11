print("Updating all existing groups into new group schema");

var dryRun = false;

var databaseList = db.adminCommand('listDatabases');

databaseList.databases.forEach(function(dbEntry) {
	if(dbEntry.name === "local" || dbEntry.name === "admin") return;
	var dbConn = db.getSiblingDB(dbEntry.name);
	print("============================== " + dbEntry.name + " =====================================");
	dbConn.getCollectionNames().forEach(function(colName){
		var colNameSplit = colName.split(".");
		if(colNameSplit[colNameSplit.length-1] === "groups"){
			print("processing " + colName);
			dbConn.getCollection(colName).find().forEach(function(group){
				if(group.objects && group.objects.length > 0) {
					if(group.objects[0].shared_ids || group.objects[0].ifc_guids) 
						return; //group already processed

					//It should be save to assume that all objects belong in
					//the same db, thus we only need to store model mapping
					var modelToIDs = {};
					group.objects.forEach(function(obj) {
						//Don't think any of them are called project anymore, but just incase.
						var modelName = obj.model || obj.project;
						if(!modelToIDs[modelName])
							modelToIDs[modelName] = {};

						if(obj.shared_id){
							if(!modelToIDs[modelName].shared_ids)
								modelToIDs[modelName].shared_ids = [];
							modelToIDs[modelName].shared_ids.push(obj.shared_id);
						}
						else if(obj.ifc_guid){
							if(!modelToIDs[modelName].ifc_guids)
								modelToIDs[modelName].ifc_guids = [];
							modelToIDs[modelName].ifc_guids.push(obj.ifc_guid);
						}
					});
					var newObjects = [];
					for(var entry in modelToIDs) {
						var newObj = {
							account: dbEntry.name,
							model: entry};
						
						if(modelToIDs[entry].shared_ids)
							newObj.shared_ids = modelToIDs[entry].shared_ids;
						
						if(modelToIDs[entry].ifc_guids)
							newObj.ifc_guids = modelToIDs[entry].ifc_guids;
						newObjects.push(newObj);
					}

					if(!dryRun)
						dbConn.getCollection(colName).updateOne({_id: group._id}, {$set: {objects: newObjects}});
				}
			});
		}
	});
});

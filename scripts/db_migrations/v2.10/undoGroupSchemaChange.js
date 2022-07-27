print("Undoing");

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
					var newObjects = [];
					if(group.objects[0].shared_ids || group.objects[0].ifc_guids) {
						group.objects.forEach(function(obj) {
							var account = obj.account;
							var model = obj.model || obj.project;

							if(obj.shared_ids){
								obj.shared_ids.forEach(function(id){
									newObjects.push({account, model, shared_id: id});
								});
								
							}
							if(obj.ifc_guids){
								obj.ifc_guids.forEach(function(id){
									newObjects.push({account, model, ifc_guid: id});
								});
							}
						});
						print(JSON.stringify(newObjects));
						if(!dryRun)
							dbConn.getCollection(colName).updateOne({_id: group._id}, {$set: {objects: newObjects}});
					}

				}
			});
		}
	});
});

var dbNames = db.getMongo().getDBNames();
var jsonColExt = ".stash.json_mpc.files";
var srcColExt = ".stash.src.files";
var dryRun = false;

dbNames.forEach( function(dbName) {
	if(dbName === "admin"|| dbName === "local") return;
	var dbConn = db.getSiblingDB(dbName);
	print("===================" + dbName + "=====================")
	dbConn.getCollectionNames().forEach(function(colName) {
		if( colName.length < jsonColExt.length ) return;
	
		if(jsonColExt === colName.substring(colName.length - jsonColExt.length)) {
			//JSON file collection
			var ids = [];
			var files = [];
			dbConn.getCollection(colName).find(
				{filename: {$regex: /.+\/.{36}\.json\.mpc/}}
			).forEach(function(fileEntry) {
				ids.push(fileEntry._id);
				files.push(fileEntry.filename);
			});
			
			if(ids.length > 0) {
				var colNameArray = colName.split(".");
				colNameArray[colNameArray.length-1] = "chunks";
				var chunksCol = colNameArray.join(".");
				print("\t" +colName + " ("+chunksCol+")");
				print("\tjson files to remove: \n\t\t" + files.join("\n\t\t"));

				if(!dryRun) {
					dbConn.getCollection(colName).remove({_id:{$in: ids}});
					dbConn.getCollection(chunksCol).remove({files_id: {$in: ids}});
				}
			}
		}
		else if(srcColExt === colName.substring(colName.length - srcColExt.length)){
			//SRC file collection
			if(!dryRun)
				dbConn.getCollection(colName).drop();
			print("\tRemoving " + colName);
			var colNameArray = colName.split(".");
			colNameArray[colNameArray.length-1] = "chunks";
			var chunksCol = colNameArray.join(".");
			print("\tRemoving " + chunksCol);
			if(!dryRun)
				dbConn.getCollection(chunksCol).drop();

		}
	});
});

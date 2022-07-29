print('adding new default types');


db.getSiblingDB('admin').adminCommand({listDatabases:1}).databases.forEach(function(database) {
	var myDb = db.getSiblingDB(database.name);
	print('DB: ' + database.name + ' ----------------------------------');
	myDb.getCollection('settings').find().forEach(function(setting) {
		if(setting.properties && setting.properties.topicTypes) {
			var newTopicTypes = [];
			var topicTypesMap = [];

			setting.properties.topicTypes.forEach(function(topicType) {
				topicTypesMap[topicType.value] = topicType.label;
			});

			topicTypesMap["clash"] = "Clash";
			topicTypesMap["diff"] = "Diff";
			topicTypesMap["rfi"] = "RFI";
			topicTypesMap["risk"] = "Risk";
			topicTypesMap["hs"] = "H&S";
			topicTypesMap["design"] = "Design";
			topicTypesMap["constructibility"] = "Constructibility";
			topicTypesMap["gis"] = "GIS";
			topicTypesMap["for_information"] = "For information";
			topicTypesMap["vr"] = "VR";
			
			for (var value in topicTypesMap) {
				newTopicTypes.push({"value": value, "label": topicTypesMap[value]});
			}
			
			var updateObj = {
				'$set':{
					"properties.topicTypes" : newTopicTypes
				}
			};

			print("Adding topic types to: " + setting.name);
			myDb.getCollection('settings').updateOne({ _id: setting._id }, updateObj);
		}
	});
});

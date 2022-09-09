var dryRun = true;

function isObject(data) {
    return typeof data === 'object';
}

function updateTeamspaceSetting(dbConn) {
	var setting = dbConn.getCollection("teamspace").findOne();
	if(setting && setting.topicTypes && (setting.topicTypes.length === 0 || isObject(setting.topicTypes[0]))
		&& setting.riskCategories && (setting.riskCategories.length === 0  || isObject(setting.riskCategories[0]))) {
		var issueMapping = {};
		var riskMapping = {};
		var newTypes = [];
		var newRiskCat = [];

		setting.topicTypes.forEach(function(entry) {
			issueMapping[entry.value] = entry.label;
			newTypes.push(entry.label);
		});
		setting.riskCategories.forEach(function(entry) {
			// Change UNKNOWN to unknown, otherwise, take label.
			var newValue = entry.value === "unknown" ? "Unknown" : entry.label;
			riskMapping[entry.value] = newValue;
			newRiskCat.push(newValue);
		});

		if(!dryRun) {
			dbConn.getCollection("teamspace").updateMany({}, {$set:{riskCategories: newRiskCat, topicTypes: newTypes}});
		}
		return {riskMapping, issueMapping};
	}
	else {
		if(!setting) print("This teamspace has no teamspace setting. Skipping...");
		return {riskMapping:{}, issueMapping:{}};
	}

}

function updateIssue(dbConn, mapping, colName) {
	updateTicket(dbConn, mapping, colName, "topic_type");
}

function updateRisk(dbConn, mapping, colName) {
	updateTicket(dbConn, mapping, colName, "category");
}

function updateTicket(dbConn, mapping, colName, typeLabel) {
	var projection =  {"comments": 1 };
	projection[typeLabel] = 1;
	dbConn.getCollection(colName).find({}, projection)
		.toArray().forEach(function(ticket) {
			var hasChange = false;
			if(ticket[typeLabel] && mapping[ticket[typeLabel]]) {
				hasChange = true;
				ticket[typeLabel] = mapping[ticket[typeLabel]];
			}

			if(ticket.comments) {

				for(var i = 0; i < ticket.comments.length; ++i) {
					if(ticket.comments[i].action) {
						var property = ticket.comments[i].action.property;
						if( property === typeLabel) {
							var from = ticket.comments[i].action.from;
							if(mapping[from]) {
								ticket.comments[i].action.from = mapping[from];
								hasChange = true;
							}
							var to = ticket.comments[i].action.to;
							if(mapping[to]) {
								ticket.comments[i].action.to = mapping[to];
								hasChange = true;
							}
						}
					}
				}
			}

			if(!dryRun) {
				var setObj = {};
				if(ticket.comments) {
					setObj.comments = ticket.comments;
				}
				setObj[typeLabel] = ticket[typeLabel];
				dbConn.getCollection(colName).updateOne({_id: ticket._id}, {$set:setObj});
			}

	});
}


function editComments(dbConn, mapping) {

	var checkIssues = mapping.issueMapping !== {};
	var checkRisks = mapping.riskMapping !== {};

	dbConn.getCollectionNames().forEach(function(col) {
		if(checkIssues && col.endsWith(".issues")) {
			updateIssue(dbConn, mapping.issueMapping, col);
		}

		if(checkRisks && col.endsWith(".risks")) {
			updateRisk(dbConn, mapping.riskMapping, col);
		 }
	 });

}

function updateTeamspace(ts) {
    var myDb = db.getSiblingDB(ts);
	print('DB: ' + ts + ' ----------------------------------');
	var mapping = updateTeamspaceSetting(myDb);

	editComments(myDb, mapping);
}

var toIgnore = ["admin", "local", "notifications"];

db.getSiblingDB("admin").adminCommand({listDatabases:1}).databases.forEach(function(database){
	if(toIgnore.indexOf(database.name) === -1)
		updateTeamspace(database.name);
});

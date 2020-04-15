var dryRun = true;

function isObject(data) {
    return typeof data === 'object';
}

function updateTeamspaceSetting(dbConn) {
	var setting = dbConn.getCollection("teamspace").findOne();
	if(setting.topicTypes && (setting.topicTypes.length === 0 || isObject(setting.topicTypes[0]))
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
			riskMapping[entry.value] = entry.value === "unknown" ? "Unknown" : entry.label;
			newRiskCat.push(entry.label);
		});

		if(!dryRun) {
			dbConn.getCollection("teamspace").update({}, {$set:{riskCategories: newRiskCat, topicTypes: newTypes}});
		}
		return {riskMapping, issueMapping};
	}
	else
		return {riskMapping:{}, issueMapping:{}};

}

function updateIssue(dbConn, mapping, colName) {
	var typeLabel = "topic_type";
	dbConn.getCollection(colName).find({"comments.action.property": typeLabel}, {"comments": 1})
		.ToArray().forEach(function(issue) {
			for(var i = 0; i < issue.comments.length; ++i) {
				var property = issue.comments.action.property;
				if( property === typeLabel) {
					var from = issue.comments.action.from;
					if(mapping[from]) {
						issue.comments.action.from = mapping[from];
					}
					var to = issue.comments.action.to;
					if(mapping[from]) {
						issue.comments.action.to = mapping[to];
					}
				}
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
	 });

}

function updateTeamspace(ts) {
    var myDb = db.getSiblingDB(ts);
	print('DB: ' + ts + ' ----------------------------------');
	var mapping = updateTeamspaceSetting(myDb);

	editComments(myDb, mapping);
}

var toIgnore = ["admin", "local", "notifications"];

updateTeamspace("subscriptionTest");

/*
db.getSiblingDB("admin").adminCommand({listDatabases:1}).databases.forEach(function(database){
	if(toIgnore.indexOf(database.name) === -1)
		updateTeamspace(database.name);
});*/

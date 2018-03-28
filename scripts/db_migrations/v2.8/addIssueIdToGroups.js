// mongo --host hostname --port port -u username -p password --authenticationDatabase db scripts/db_migrations/v2.8/addIssueIdToGroups.js

print('adding issue IDs to groups');

var addIssueIdToGroup = function(myDb, settingId, groupId, issueId) {
	print('adding ' + issueId + ' to ' + groupId);
	myDb.getCollection(settingId + '.groups').update({ _id: groupId }, { $set: { issue_id: issueId } });
};

db.getSiblingDB('admin').adminCommand({listDatabases:1}).databases.forEach(function(database) {
	var myDb = db.getSiblingDB(database.name);
	print('DB: ' + database.name + ' ----------------------------------');
	myDb.getCollection('settings').find().forEach(function(setting) {
		print('Model: ' + setting._id);
		myDb.getCollection(setting._id + '.issues').find().forEach(function(issue) {
			print('Issue: ' + issue.name);
			if (issue.group_id) {
				addIssueIdToGroup(myDb, setting._id, issue.group_id, issue._id);
			}
			for (var i = 0; issue.viewpoints && i < issue.viewpoints.length; i++) {
				if (issue.viewpoints[i].highlighted_group_id) {
					addIssueIdToGroup(myDb, setting._id, issue.viewpoints[i].highlighted_group_id, issue._id);
				}
				if (issue.viewpoints[i].hidden_group_id) {
					addIssueIdToGroup(myDb, setting._id, issue.viewpoints[i].hidden_group_id, issue._id);
				}
				if (issue.viewpoints[i].shown_group_id) {
					addIssueIdToGroup(myDb, setting._id, issue.viewpoints[i].shown_group_id, issue._id);
				}
				if (issue.viewpoints[i].group_id) {
					addIssueIdToGroup(myDb, setting._id, issue.viewpoints[i].group_id, issue._id);
				}
			}
		});
	});
});

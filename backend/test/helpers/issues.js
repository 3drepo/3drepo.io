
const DEFAULT_ISSUE_DATA = {
	"name" : "new issue",
	"status": "open",
	"priority": "low",
	"topic_type": "for info",
	"viewpoint":{
		"up":[0,1,0],
		"position":[38,38 ,125.08011914810137],
		"look_at":[0,0,-163.08011914810137],
		"view_dir":[0,0,-1],
		"right":[1,0,0],
		"unityHeight ":3.537606904422707,
		"fov":2.1124830653010416,
		"aspect_ratio":0.8750189337327384,
		"far":276.75612077194506 ,
		"near":76.42411012233212,
		"clippingPlanes":[]
	},
	"assigned_roles":[]
};


const createIssue = (account, modelId) => (agent, issueData = null) =>  next => {
	agent.post(`/${account}/${modelId}/issues.json`)
		.send({...DEFAULT_ISSUE_DATA, ...(issueData || {})})
		.expect(200 , (err, res) => next(err, res.body));
};


const attachDocument = (account, modelId) => (agent, name , filename, issueId = null) => (issue,  next) => {
	next = next || issue;
	issueId = issueId || issue._id;

	console.log('name here ' + name);

	agent.post(`/${account}/${modelId}/issues/${issueId}/attach-file`)
		.field({name, hey:true})
		.attach("file", __dirname + "/../../statics/documents/" + filename)
		.expect(200, (err, res) => next(err, res.body));
};

module.exports = {
	createIssue,
	attachDocument
};
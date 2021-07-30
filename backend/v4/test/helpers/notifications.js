const { checkPermissionsHelper } = require("../../middlewares/checkPermissions");

const NOTIFICATIONS_URL = "/notifications";

module.exports = {
	deleteNotifications: agent => (...args)  => {
		const next = args.pop();

		agent.delete(NOTIFICATIONS_URL).expect(200, (err) => {
			if (next) next(err);
		})
	},
	fetchNotification: agent => (...args) => {
		const next = args.pop();
		agent.get(NOTIFICATIONS_URL).expect(200, (err, res) => next(err, res.body));
	},
	filterByIssueAssigned: n => n.filter(n => n.type == 'ISSUE_ASSIGNED'),
	filterByIssueClosed: n => n.filter(n => n.type == 'ISSUE_CLOSED'),
}
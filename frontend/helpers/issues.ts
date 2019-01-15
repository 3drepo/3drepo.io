import { pick, get } from 'lodash';
import { getAPIUrl } from '../services/api';
import { ISSUE_STATUSES_COLORS, ISSUE_STATUSES_ICONS } from '../constants/issues';

export const prepareIssue = (issue, jobs = []) => {
	const thumbnail = getAPIUrl(issue.thumbnail);
	const { Icon, color } = this.getStatusIcon(issue.priority, issue.status);
	const roleColor = get(jobs.find((job) => job._id === get(issue.assigned_roles, '[0]')), 'color');

	return {
		name: issue.name,
		description: issue.description,
		author: issue.owner,
		createdDate: issue.created,
		thumbnail,
		StatusIconComponent: Icon,
		statusColor: color,
		roleColor
	};
};

export const getStatusIcon = (priority, status) => {
  const statusIcon = {
    Icon: ISSUE_STATUSES_ICONS[status] || null,
    color: ISSUE_STATUSES_COLORS[status] || ISSUE_STATUSES_COLORS[priority] || null
  };

  return {...statusIcon};
};

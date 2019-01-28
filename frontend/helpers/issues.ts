import { get, omit } from 'lodash';
import { getAPIUrl } from '../services/api';
import { STATUSES_COLORS, STATUSES_ICONS } from '../constants/issues';

export const prepareIssue = (issue, jobs = []) => {
	const thumbnail = getAPIUrl(issue.thumbnail);
	const { Icon, color } = this.getStatusIcon(issue.priority, issue.status);
	const roleColor = get(jobs.find((job) => job._id === get(issue.assigned_roles, '[0]')), 'color');

	return {
		...issue,
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
    Icon: STATUSES_ICONS[status] || null,
    color: STATUSES_COLORS[status] || STATUSES_COLORS[priority] || null
  };

  return {...statusIcon};
};

export const mergeIssueData = (source, data = source) => {
	const hasUnassignedRole = !data.assigned_roles;

	return {
		...source,
		...omit(data, ['assigned_roles', 'description']),
		assigned_roles: hasUnassignedRole ? [] : [data.assigned_roles]
	};
};

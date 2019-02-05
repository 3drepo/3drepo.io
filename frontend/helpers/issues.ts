import { get, omit } from 'lodash';
import { getAPIUrl } from '../services/api';
import { STATUSES_COLOURS, STATUSES_ICONS, STATUSES } from '../constants/issues';
import { isAdmin, hasPermissions, PERMISSIONS } from './permissions';

export const prepareIssue = (issue, jobs = []) => {
	const thumbnail = getAPIUrl(issue.thumbnail);
	const descriptionThumbnail = issue.viewpoint && issue.viewpoint.screenshot
		? getAPIUrl(issue.viewpoint.screenshot)
		: (issue.descriptionThumbnail || '');
	const { Icon, color } = this.getStatusIcon(issue.priority, issue.status);
	const roleColor = get(jobs.find((job) => job.name === get(issue.assigned_roles, '[0]')), 'color');

	return {
		...issue,
		defaultHidden: issue.status === STATUSES.CLOSED,
		name: issue.name,
		description: issue.desc,
		author: issue.owner,
		createdDate: issue.created,
		thumbnail,
		descriptionThumbnail,
		StatusIconComponent: Icon,
		statusColor: color,
		roleColor
	};
};

export const getStatusIcon = (priority, status) => {
  const statusIcon = {
    Icon: STATUSES_ICONS[status] || null,
    color: STATUSES_COLOURS[status] || STATUSES_COLOURS[priority] || null
  };

  return {...statusIcon};
};

export const mergeIssueData = (source, data = source) => {
	const hasUnassignedRole = !data.assigned_roles;

	return {
		...source,
		...omit(data, ['assigned_roles', 'description', 'descriptionThumbnail']),
		assigned_roles: hasUnassignedRole ? [] : [data.assigned_roles],
		desc: data.description
	};
};

const convertActionValueToText = (value = '') => {
	const actions = {
		'none': 'None',
		'low': 'Low',
		'medium': 'Medium',
		'high': 'High',
		'open': 'Open',
		'in progress': 'In progress',
		'for approval': 'For approval',
		'closed': 'Closed'
	};

	let actionText = value;

	value = value.toLowerCase();

	if (actions.hasOwnProperty(value)) {
		actionText = actions[value];
	}

	return actionText;
};

export const convertActionCommentToText = (action, owner, topicTypes = []) => {
	let text = '';
	let from = '';
	let to = '';
	let propertyName = '';

	if (action) {
		switch (action.property) {
		case 'priority':

			propertyName = 'Priority';
			from = convertActionValueToText(action.from);
			to = convertActionValueToText(action.to);
			break;

		case 'status':

			propertyName = 'Status';
			from = convertActionValueToText(action.from);
			to = convertActionValueToText(action.to);
			break;

		case 'assigned_roles':
			propertyName = 'Assigned';
			from = action.from.toString();
			to = action.to.toString();
			break;

		case 'topic_type':
			propertyName = 'Type';
			if (topicTypes) {

				const fromType = topicTypes.find((topicType) => {
					return topicType.value === action.from;
				});
				const toType = topicTypes.find((topicType) => {
					return topicType.value === action.to;
				});
				if (from && fromType.label) {
					from = fromType.label;
				}
				if (to && toType.label) {
					to = toType.label;
				}
			}
			break;

		case 'desc':
			propertyName = 'Description';
			break;

		case 'due_date':
			propertyName = 'Due Date';
			if (action.to) {
				to = (new Date(parseInt(action.to, 10))).toLocaleDateString();
			}
			if (action.from) {
				from = (new Date(parseInt(action.from, 10))).toLocaleDateString();
			} else {
				text = propertyName + ' set to ' +
					action.to + ' by ' +
					owner;
			}
			break;

		case 'bcf_import':
			propertyName = 'BCF Import';
			text = propertyName + ' by ' + owner;
			break;
		}
	}

	if (0 === text.length) {
		if (action && !action.from) {
			from = '(empty)';
		}
		if (action && !action.to) {
			to = '(empty)';
		}
		if (action && !propertyName) {
			propertyName = '(empty)';
		}
		text = `${propertyName} updated from ${from} to ${to} by ${owner}`;
	}
	return text;
};

const isOpenIssue = (status) => status !== 'closed';

const userJobMatchesCreator = (userJob, issueData) => {
	return (userJob._id && issueData.creator_role && userJob._id === issueData.creator_role);
};

const isIssueViewer = (permissions) => {
	return permissions && !hasPermissions(PERMISSIONS.COMMENT_ISSUE, permissions);
};

const canCommentIssue = (permissions) => {
	return permissions && hasPermissions(PERMISSIONS.COMMENT_ISSUE, permissions);
};

const isJobOwner = (issueData, userJob, permissions, currentUser) => {
	return issueData && userJob &&
		(issueData.owner === currentUser ||
		userJobMatchesCreator(userJob, issueData)) &&
		!isIssueViewer(permissions);
};

const isAssignedJob = (issueData, userJob, permissions) => {
	return issueData && userJob &&
		(userJob._id &&
			issueData.assigned_roles[0] &&
			userJob._id === issueData.assigned_roles[0]) &&
			!isIssueViewer(permissions);
};

export const canChangeStatusToClosed = (issueData, userJob, permissions, currentUser) => {
	return isAdmin(permissions) || isJobOwner(issueData, userJob, permissions, currentUser);
};

export const canChangeStatus = (issueData, userJob, permissions, currentUser) => {
	return canChangeStatusToClosed(issueData, userJob, permissions, currentUser) ||
		isAssignedJob(issueData, userJob, permissions);
};

export const canChangeBasicProperty = (issueData, userJob, permissions, currentUser) => {
	return isAdmin(permissions) || isJobOwner(issueData, userJob, permissions, currentUser) &&
		canComment(issueData, userJob, permissions, currentUser);
};

export const canChangeAssigned = (issueData, userJob, permissions, currentUser) => {
	return isAdmin(permissions) || canChangeBasicProperty(issueData, userJob, permissions, currentUser);
};

export const canComment = (issueData, userJob, permissions, currentUser) => {
	const isNotClosed = issueData && issueData.status && isOpenIssue(issueData.status);

	const ableToComment =
		isAdmin(permissions) ||
		isJobOwner(issueData, userJob, permissions, currentUser) ||
		canCommentIssue(permissions);

	return ableToComment && isNotClosed;
};

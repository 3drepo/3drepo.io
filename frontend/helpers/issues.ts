import { get, omit } from 'lodash';
import { getAPIUrl } from '../services/api';
import { STATUSES_COLOURS, STATUSES_ICONS, STATUSES } from '../constants/issues';
import { isAdmin, hasPermissions, PERMISSIONS } from './permissions';
import { sortByDate } from './sorting';

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
		roleColor,
		comments: issue.comments || []
	};
};

export const prepareComments = (comments = []) => {
	if (!comments.length) {
		return comments;
	}

	const preparedComments = comments.map((comment) => this.prepareComment(comment));
	return sortByDate(preparedComments, {order: 'desc'});
};

export const prepareComment = (comment) => {
	if (comment.action) {
		comment.comment = convertActionCommentToText(comment, undefined);
	}
	if (comment.viewpoint && comment.viewpoint.screenshot) {
		comment.viewpoint.screenshotPath = getAPIUrl(comment.viewpoint.screenshot);
	}

	return comment;
};

const convertActionCommentToText = (comment, topicTypes) => {
	let text = '';

	if (comment) {
		switch (comment.action.property) {
		case 'priority':

			comment.action.propertyText = 'Priority';
			comment.action.from = convertActionValueToText(comment.action.from);
			comment.action.to = convertActionValueToText(comment.action.to);
			break;

		case 'status':

			comment.action.propertyText = 'Status';
			comment.action.from = convertActionValueToText(comment.action.from);
			comment.action.to = convertActionValueToText(comment.action.to);
			break;

		case 'assigned_roles':

			comment.action.propertyText = 'Assigned';
			comment.action.from = comment.action.from.toString();
			comment.action.to = comment.action.to.toString();
			break;

		case 'topic_type':

			comment.action.propertyText = 'Type';
			if (topicTypes) {

				const from = topicTypes.find((topicType) => {
					return topicType.value === comment.action.from;
				});

				const to = topicTypes.find((topicType) => {
					return topicType.value === comment.action.to;
				});

				if (from && from.label) {
					comment.action.from = from.label;
				}

				if (to && to.label) {
					comment.action.to = to.label;
				}
			}
			break;

		case 'desc':

			comment.action.propertyText = 'Description';
			break;

		case 'due_date':

			comment.action.propertyText = 'Due Date';
			if (comment.action.to) {
				comment.action.to = (new Date(parseInt(comment.action.to, 10))).toLocaleDateString();
			}
			if (comment.action.from) {
				comment.action.from = (new Date(parseInt(comment.action.from, 10))).toLocaleDateString();
			} else {
				text = comment.action.propertyText + ' set to ' +
					comment.action.to + ' by ' +
					comment.owner;
			}
			break;

		case 'bcf_import':

			comment.action.propertyText = 'BCF Import';
			text = comment.action.propertyText + ' by ' + comment.owner;
			break;

		}
	}

	if (0 === text.length) {
		if (!comment.action.from) {
			comment.action.from = '(empty)';
		}

		if (!comment.action.to) {
			comment.action.to = '(empty)';
		}

		text = comment.action.propertyText + ' updated from ' +
			comment.action.from + ' to ' +
			comment.action.to + ' by ' +
			comment.owner;
	}

	comment.action.text = text;

	return text;
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

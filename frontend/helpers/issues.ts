/**
 *  Copyright (C) 2019 3D Repo Ltd
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as
 *  published by the Free Software Foundation, either version 3 of the
 *  License, or (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Affero General Public License for more details.
 *
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

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

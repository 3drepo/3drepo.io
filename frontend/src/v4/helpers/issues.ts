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

import fileDialog from 'file-dialog';
import {
	ISSUE_COLORS,
	ISSUE_DEFAULT_HIDDEN_STATUSES,
	ISSUE_FILTER_RELATED_FIELDS,
	ISSUE_PRIORITIES,
	ISSUE_STATUSES,
	ISSUES_ACTIONS_MENU,
	PRIORITIES,
	STATUSES_ICONS
} from '../constants/issues';
import { getFilterValues, UNASSIGNED_JOB } from '../constants/reportedItems';
import { getAPIUrl } from '../services/api/default';
import { hasPermissions, isAdmin, PERMISSIONS } from './permissions';
import { prepareResources } from './resources';
import { setShapesUuids } from './shapes';

export const getStatusIcon = (priority, status) => {
	const statusIcon = {
		Icon: STATUSES_ICONS[status] || null,
		color: (ISSUE_COLORS[status] || ISSUE_COLORS[priority] || ISSUE_COLORS[PRIORITIES.NONE]).color
	};

	return {...statusIcon};
};

export const prepareIssue = (issue, jobs = []) => {
	const preparedIssue = {...issue};

	if (issue.thumbnail) {
		preparedIssue.thumbnail = `${getAPIUrl(issue.thumbnail)}?${new Date().getTime()}`;
	}

	const descriptionThumbnail = issue.viewpoint && issue.viewpoint.screenshot
		? getAPIUrl(issue.viewpoint.screenshot)
		: (issue.descriptionThumbnail || '');

	if (descriptionThumbnail) {
		preparedIssue.descriptionThumbnail = descriptionThumbnail;
	}

	if (issue.priority && issue.status) {
		const { Icon, color } = getStatusIcon(issue.priority, issue.status);
		preparedIssue.StatusIconComponent = Icon;
		preparedIssue.statusColor = color;
	}

	if (issue.assigned_roles) {
		const assignedJob = jobs.find((job) => job.name === (issue.assigned_roles || [])[0]);
		const roleColor = (assignedJob || {}).color;
		preparedIssue.roleColor = roleColor;
	}

	if (issue.status) {
		preparedIssue.defaultHidden = ISSUE_DEFAULT_HIDDEN_STATUSES.includes(issue.status);
	}

	if (issue.shapes) {
		preparedIssue.shapes = setShapesUuids(preparedIssue.shapes);
	}

	if (issue.resources) {
		issue.resources = prepareResources(issue.account, issue.model, issue.resources);
	}

	return preparedIssue;
};

export const getIssuePinColor = (issue: any) => {
	const {priority, status} = issue;
	const colorToUse = ISSUE_COLORS[status] || ISSUE_COLORS[priority] || ISSUE_COLORS[PRIORITIES.NONE];
	return colorToUse.pinColor;
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
			issueData.assigned_roles && issueData.assigned_roles.length &&
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

const getFromToFilter = (label) =>  [{
	label: 'From',
	value: {
		label: label + ' from',
		value: label + 'from',
		date: null
	}
}, {
	label: 'To',
	value: {
		label: label + ' to',
		value: label + 'to',
		date: null
	}
}];

export const filtersValuesMap = (jobs, topicTypes) => {
	const jobsList = [...jobs, UNASSIGNED_JOB];

	return {
		[ISSUE_FILTER_RELATED_FIELDS.STATUS]: getFilterValues(ISSUE_STATUSES),
		[ISSUE_FILTER_RELATED_FIELDS.CREATED_BY]: getFilterValues(jobs),
		[ISSUE_FILTER_RELATED_FIELDS.ASSIGNED_TO]: getFilterValues(jobsList),
		[ISSUE_FILTER_RELATED_FIELDS.PRIORITY]: getFilterValues(ISSUE_PRIORITIES),
		[ISSUE_FILTER_RELATED_FIELDS.TYPE]: getFilterValues(topicTypes
				.map((category) => ({ value: category, name: category }))),
		[ISSUE_FILTER_RELATED_FIELDS.CREATED_DATE]: getFromToFilter('Created'),
		[ISSUE_FILTER_RELATED_FIELDS.START_DATETIME]: getFromToFilter('Start')
	};
};

export const getHeaderMenuItems = (props) => {
	const {teamspace,
		model,
		revision,
		printItems,
		downloadItems,
		importBCF,
		exportBCF,
		toggleSortOrder,
		setSortBy,
		toggleShowPins,
		showPins,
		toggleClosedIssues,
		showClosedIssues,
		sortOrder,
		sortByField
		} = props;

	const items = [
		{
			...ISSUES_ACTIONS_MENU.IMPORT_BCF,
			onClick: () => {
				fileDialog({ accept: '.zip,.bcfzip,.bcf' }, (files) => {
					importBCF(teamspace, model, files[0], revision);
				});
			}
		}, {
			...ISSUES_ACTIONS_MENU.EXPORT_BCF,
			onClick: () => exportBCF(teamspace, model)
		}, {
			...ISSUES_ACTIONS_MENU.DOWNLOAD,
			onClick: () => downloadItems(teamspace, model)
		}, {
			...ISSUES_ACTIONS_MENU.SORT_ORDER,
			onClick: () => {
				toggleSortOrder();
			},
			Icon: sortOrder === 'asc' ? ISSUES_ACTIONS_MENU.SORT_ORDER.ASC : ISSUES_ACTIONS_MENU.SORT_ORDER.DESC
		}
	];

	const extraItems = [];

	if (!!toggleShowPins) {
		extraItems.push({
			...ISSUES_ACTIONS_MENU.SHOW_PINS,
			enabled: showPins,
			onClick: () => toggleShowPins(!showPins)
		});
	}

	if (toggleClosedIssues) {
		extraItems.push({
			...ISSUES_ACTIONS_MENU.SHOW_CLOSED_ISSUES,
			enabled: showClosedIssues,
			onClick: toggleClosedIssues
		});
	}

	extraItems.push({
		label: 'Sort by',
		subItems: [
			{
				label: 'Created at',
				onClick: () => setSortBy('created'),
				enabled: sortByField === 'created'
			},
			{
				label: 'Start date',
				onClick: () => setSortBy('sequence_start'),
				enabled: sortByField === 'sequence_start'
			},
		]
	});

	return [...items, ...extraItems];
};

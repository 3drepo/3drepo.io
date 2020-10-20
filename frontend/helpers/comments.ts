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

import { uniqBy, values } from 'lodash';
import linkify from 'markdown-linkify';
import { getAPIUrl } from '../services/api';
import { getRiskConsequenceName, getRiskLikelihoodName } from './risks';
import { sortByDate } from './sorting';

export const INTERNAL_IMAGE_PATH_PREFIX = `API/`;
export const INTERNAL_VIEWPOINT_ID_REGEX = new RegExp('#SS-[\\w-]+', 'gi');
export const MARKDOWN_USER_REFERENCE_REGEX = new RegExp('@\\w+', 'gi');
export const MARKDOWN_TICKET_REFERENCE_REGEX = new RegExp('#\\d+', 'gi');
export const MARKDOWN_RESOURCE_REFERENCE_REGEX = new RegExp('#res.[\\w-]+', 'gi');
export const MARKDOWN_INTERNAL_IMAGE_PATH_REGEX = new RegExp(`${INTERNAL_IMAGE_PATH_PREFIX}`, 'gi');
export const VIEWPOINT_ID_REGEX = new RegExp('/viewpoints/[\\w-]+', 'gi');

export interface IComment {
	action?: {property: string, from: string, to: string, propertyText: string, text: string};
	comment: string | undefined | null;
	_id: string;
	guid: number;
	owner: string;
	sealed: boolean;
}

export interface IDetails {
	account: string;
	_id: string;
	model: string;
}

export const createAttachResourceComments = (owner: string,  resources = []) =>
	resources.map((r, i) =>
	({
		_id: +(new Date()),
		guid: i,
		owner,
		action: {property: 'resource', to: r.name},
		sealed: true
	}));

export const createRemoveResourceComment = (owner: string, {name} ) =>
	({
		_id: +(new Date()),
		guid: 0,
		owner,
		action: {property: 'resource', from: name},
		sealed: true
	});

export const prepareComments = (comments = []) => {
	comments = comments.filter((c) => !c.action || c.action.property !== 'extras');

	if (!comments.length) {
		return comments;
	}

	const preparedComments = comments.map((comment) => prepareComment(comment));
	return sortByDate(preparedComments, {order: 'desc'});
};

export const prepareComment = (comment) => {
	if (comment.action) {
		comment.comment = convertActionCommentToText(comment);
	}
	if (comment.viewpoint && comment.viewpoint.screenshot) {
		comment.viewpoint.screenshotPath = getAPIUrl(comment.viewpoint.screenshot);
	}

	comment.comment = comment.comment ? comment.comment.replace(/[\n]{2,}/g, `\n\n`) : comment.comment;

	return comment;
};

const convertActionCommentToText = (comment: IComment) => {
	let text = '';

	if (comment) {
		switch (comment.action.property) {
			case 'resource' :
				if (comment.action.to) {
					text = `Resource ${comment.action.to} attached by ${comment.owner}`;
				} else {
					text = `Resource ${comment.action.from} removed by ${comment.owner}`;
				}
				break;
			case 'associated_activity':
				comment.action.propertyText = 'Associated activity';
				break;
			case 'category':
				comment.action.propertyText = 'Category';
				break;
			case 'consequence':
				comment.action.propertyText = 'Consequence';
				if (undefined !== comment.action.to) {
					comment.action.to = getRiskConsequenceName(parseInt(comment.action.to, 10));
				}
				if (undefined !== comment.action.from) {
					comment.action.from = getRiskConsequenceName(parseInt(comment.action.from, 10));
				} else {
					text = comment.action.propertyText + ' set to ' +
						comment.action.to + ' by ' +
						comment.owner;
				}
				break;
			case 'element':
				comment.action.propertyText = 'Element';
				break;
			case 'likelihood':
				comment.action.propertyText = 'Likelihood';
				if (undefined !== comment.action.to) {
					comment.action.to = getRiskLikelihoodName(parseInt(comment.action.to, 10));
				}
				if (undefined !== comment.action.from) {
					comment.action.from = getRiskLikelihoodName(parseInt(comment.action.from, 10));
				} else {
					text = comment.action.propertyText + ' set to ' +
						comment.action.to + ' by ' +
						comment.owner;
				}
				break;
			case 'location_desc':
				comment.action.propertyText = 'Location';
				break;
			case 'mitigation_desc':
				comment.action.propertyText = 'Treatment description';
				text = comment.action.propertyText + ' updated by ' + comment.owner;
				break;
			case 'mitigation_detail':
				comment.action.propertyText = 'Treatment detail';
				break;
			case 'mitigation_stage':
				comment.action.propertyText = 'Treatment stage';
				break;
			case 'mitigation_type':
				comment.action.propertyText = 'Treatment type';
				break;
			case 'mitigation_status':
				comment.action.propertyText = 'Treatment status';
				break;
			case 'priority':
				comment.action.propertyText = 'Priority';
				comment.action.from = convertActionValueToText(comment.action.from);
				comment.action.to = convertActionValueToText(comment.action.to);
				break;
			case 'residual_consequence':
				comment.action.propertyText = 'Treated consequence';
				if (undefined !== comment.action.to) {
					comment.action.to = getRiskConsequenceName(parseInt(comment.action.to, 10));
				}
				if (undefined !== comment.action.from) {
					comment.action.from = getRiskConsequenceName(parseInt(comment.action.from, 10));
				} else {
					text = comment.action.propertyText + ' set to ' +
						comment.action.to + ' by ' +
						comment.owner;
				}
				break;
			case 'residual_likelihood':
				comment.action.propertyText = 'Treated likelihood';
				if (undefined !== comment.action.to) {
					comment.action.to = getRiskLikelihoodName(parseInt(comment.action.to, 10));
				}
				if (undefined !== comment.action.from) {
					comment.action.from = getRiskLikelihoodName(parseInt(comment.action.from, 10));
				} else {
					text = comment.action.propertyText + ' set to ' +
						comment.action.to + ' by ' +
						comment.owner;
				}
				break;
			case 'residual_risk':
				comment.action.propertyText = 'Residual risk';
				text = comment.action.propertyText + ' updated by ' + comment.owner;
				break;
			case 'risk_factor':
				comment.action.propertyText = 'Risk factor';
				break;
			case 'likelihood':
				comment.action.propertyText = 'Likelihood';
				break;
			case 'safetibase_id':
				comment.action.propertyText = 'Safetibase ID';
				break;
			case 'scope':
				comment.action.propertyText = 'Construction scope';
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
				break;
			case 'desc':
				comment.action.propertyText = 'Description';
				text = comment.action.propertyText + ' updated by ' + comment.owner;
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
				comment.action.propertyText = 'BCF import';
				text = comment.action.propertyText + ' by ' + comment.owner;
				break;
			case 'position' :
				// In this case is not needed to be specific of the value that changed
				comment.action.to = comment.action.from = null;
				comment.action.propertyText = 'Pin';
				break;

			case 'screenshot':
				comment.action.to = comment.action.from = null;
				comment.action.propertyText = 'Screenshot';
				break;

			case 'viewpoint':
				comment.action.to = comment.action.from = null;
				comment.action.propertyText = 'Viewpoint';
				break;

			case 'issue_referenced':
				comment.action.propertyText = 'Referenced';
				text = 'Issue referenced in #' + comment.action.to  + ' by ' + comment.owner;
				break;

		}
	}

	if (0 === text.length) {
		if (!comment.action.from || !comment.action.to) {
			text = comment.action.propertyText + ' updated by ' + comment.owner;
		} else {
			text = comment.action.propertyText + ' updated from ' +
				comment.action.from + ' to ' +
				comment.action.to + ' by ' +
				comment.owner;
		}
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

export const transformCustomsLinksToMarkdown = ( details: IDetails, comment: IComment, tickets, type ) => {
	let text = comment.comment;

	if (!text || (Boolean(comment.action)
	&&  !['issue_referenced', 'risk_referenced'].includes(comment.action?.property))) {
		return text;
	}

	const usersReferences = text.matchAll(MARKDOWN_USER_REFERENCE_REGEX);
	const ticketsReferences = text.matchAll(MARKDOWN_TICKET_REFERENCE_REGEX) || [];
	const resourcesReferences = text.matchAll(MARKDOWN_RESOURCE_REFERENCE_REGEX);
	const viewpointReferences = text.matchAll(INTERNAL_VIEWPOINT_ID_REGEX);

	if (viewpointReferences) {
		const { account: teamspace, model: projectId, _id: ticketId } = details;
		const referenceType = type === 'risk' ? 'risk' : 'issues';

		const uniqViewpointReferences = uniqBy([...viewpointReferences], 0);
		uniqViewpointReferences.forEach(({ 0: viewpointReference }) => {
			const viewpointId = viewpointReference.replace('#SS-', '');
			const referenceRegExp = RegExp(viewpointReference);
			text = text
				.replace(referenceRegExp,
				// tslint:disable-next-line:max-line-length
				`![](${INTERNAL_IMAGE_PATH_PREFIX}${teamspace}/${projectId}/${referenceType}/${ticketId}/viewpoints/${viewpointId}/screenshot.png)`);
		});
	}

	if (ticketsReferences) {
		const uniqIssuesReferences = uniqBy([...ticketsReferences], 0);
		uniqIssuesReferences.forEach(({ 0: issueReference }) => {
			const ticketNumber = Number(issueReference.replace('#', ''));
			const ticketData = values(tickets).find((ticket) => ticket.number === ticketNumber);

			if (ticketData && ticketData._id) {
				const referenceRegExp = RegExp(issueReference, 'g');
				text = text.replace(referenceRegExp, `[${issueReference}](${ticketData._id})`);
			}
		});
	}

	if (usersReferences) {
		const uniqUsersReferences = uniqBy([...usersReferences], 0);

		uniqUsersReferences.forEach(({ 0: userReference }) => {
			const referenceRegExp = RegExp(userReference, 'g');
			text = text.replace(referenceRegExp, `[${userReference}](${userReference.replace('@', '')})`);
		});
	}

	if (resourcesReferences) {
		const uniqResourceReferences = uniqBy([...resourcesReferences], 0);

		uniqResourceReferences.forEach(({ 0: resourceReference }) => {
			const referenceRegExp = RegExp(resourceReference, 'g');
			text = text
				.replace(referenceRegExp, `[${resourceReference}](${resourceReference.replace('#res.', '')} "${type}")`);
		});
	}

	text = linkify(text);

	return text;
};

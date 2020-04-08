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

import { getAPIUrl } from '../services/api';
import { getRiskConsequenceName, getRiskLikelihoodName } from './risks';
import { sortByDate } from './sorting';

export const createAttachResourceComments = (owner: string,  resources = []) =>
	resources.map((r, i) =>
		prepareComment({_id: +(new Date()), guid: i, owner, action: {property: 'resource', to: r.name}, sealed: true }));

export const createRemoveResourceComment = (owner: string, {name} ) =>
	prepareComment({_id: +(new Date()), guid: 0, owner, action: {property: 'resource', from: name}, sealed: true });

export const prepareComments = (comments = []) => {
	comments = comments.filter((c) => !c.action || c.action.property !== 'extras');

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

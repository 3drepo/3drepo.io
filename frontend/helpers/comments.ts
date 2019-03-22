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
			case 'associated_activity':
				comment.action.propertyText = 'Associated Activity';
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
			case 'mitigation_desc':
				comment.action.propertyText = 'Mitigation description';
				text = comment.action.propertyText + ' updated by ' + comment.owner;
				break;
			case 'mitigation_status':
				comment.action.propertyText = 'Mitigation Status';
				break;
			case 'priority':
				comment.action.propertyText = 'Priority';
				comment.action.from = convertActionValueToText(comment.action.from);
				comment.action.to = convertActionValueToText(comment.action.to);
				break;
			case 'residual_consequence':
				comment.action.propertyText = 'Mitigated consequence';
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
				comment.action.propertyText = 'Mitigated likelihood';
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
			case 'likelihood':
				comment.action.propertyText = 'Likelihood';
				break;
			case 'safetibase_id':
				comment.action.propertyText = 'Safetibase ID';
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

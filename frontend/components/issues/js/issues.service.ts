/**
 *  Copyright (C) 2018 3D Repo Ltd
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
import { APIService } from '../../home/js/api.service';
import { AuthService } from '../../home/js/auth.service';
import { IChip } from '../../panel/js/panel-card-chips-filter.component';
import { PanelService } from '../../panel/js/panel.service';
import { TreeService } from '../../tree/js/tree.service';
import { ViewerService } from '../../viewer/js/viewer.service';
import { stringSearch } from '../../../helpers/searching';
import { Viewer } from '../../../services/viewer/viewer';

declare const Pin;

export class IssuesService {
	public static $inject: string[] = [
		'$q',
		'$sanitize',
		'$timeout',
		'$filter',

		'APIService',
		'AuthService',
		'ClientConfigService',
		'MultiSelectService',
		'PanelService',
		'TreeService',
		'ViewerService'
	];

	public state: any;
	private groupsCache: any;
	private pin: any;
	private newPinId: string;

	constructor(
		private $q,
		private $sanitize,
		private $timeout,
		private $filter,

		private apiService: APIService,
		private authService: AuthService,
		private clientConfigService: any,
		private multiSelectService,
		private panelService: PanelService,
		private treeService: TreeService,
		private viewerService: ViewerService
	) {
		this.pin = {
			pinDropMode: null
		};
		this.newPinId = 'newPinId';
	}

	public filterNotification(issue: any, issuesIds: []) {
		return issuesIds.some((i) => i === issue._id);
	}

	public handleIssueFilter(issue: any, filterText: string) {
		// Required custom filter due to the fact that Angular
		// does not allow compound OR filters

		// Exit the function as soon as we found a match.

		// Search the title and desc
		if (stringSearch(issue.title, filterText) ||
			stringSearch(issue.desc, filterText)) {
			return true;
		}

		// Search the list of assigned issues
		if (issue.hasOwnProperty('assigned_roles')) {
			for (let roleIdx = 0; roleIdx < issue.assigned_roles.length; ++roleIdx) {
				if (stringSearch(issue.assigned_roles[roleIdx], filterText)) {
					return true;
				}
			}
		}

		// Search the comments
		if (issue.hasOwnProperty('comments')) {
			for (let commentIdx = 0; commentIdx < issue.comments.length; ++commentIdx) {
				if (!issue.comments[commentIdx].action &&  // skip any action comments (i.e system messages)
					stringSearch(issue.comments[commentIdx].comment, filterText) ||
					stringSearch(issue.comments[commentIdx].owner, filterText)) {
					return true;
				}
			}
		}

		return false;

	}

	public userJobMatchesCreator(userJob, issueData) {
		return (userJob._id &&
			issueData.creator_role &&
			userJob._id === issueData.creator_role);
	}

	public isViewer(permissions) {
		return permissions && !this.authService.hasPermission(
			this.clientConfigService.permissions.PERM_COMMENT_ISSUE,
			permissions
		);
	}

	public isAssignedJob(issueData, userJob, permissions) {
		return issueData && userJob &&
			(userJob._id &&
				issueData.assigned_roles[0] &&
				userJob._id === issueData.assigned_roles[0]) &&
				!this.isViewer(permissions);
	}

	public isAdmin(permissions) {
		return permissions && this.authService.hasPermission(
			this.clientConfigService.permissions.PERM_MANAGE_MODEL_PERMISSION,
			permissions
		);
	}

	public isJobOwner(issueData, userJob, permissions) {
		return issueData && userJob &&
			(issueData.owner === this.authService.getUsername() ||
			this.userJobMatchesCreator(userJob, issueData)) &&
			!this.isViewer(permissions);
	}

	public canChangePriority(issueData, userJob, permissions) {
		return (this.isAdmin(permissions) || this.isJobOwner(issueData, userJob, permissions)) &&
			this.canComment(issueData, userJob, permissions);
	}

	public canChangeStatusToClosed(issueData, userJob, permissions) {
		return this.isAdmin(permissions) || this.isJobOwner(issueData, userJob, permissions);
	}

	public canChangeStatus(issueData, userJob, permissions) {
		return this.canChangeStatusToClosed(issueData, userJob, permissions) ||
			this.isAssignedJob(issueData, userJob, permissions);
	}

	public canChangeType(issueData, userJob, permissions) {
		return (this.isAdmin(permissions) || this.isJobOwner(issueData, userJob, permissions)) &&
			this.canComment(issueData, userJob, permissions);
	}

	public canChangeDescription(issueData, userJob, permissions) {
		return (this.isAdmin(permissions) || this.isJobOwner(issueData, userJob, permissions)) &&
			this.canComment(issueData, userJob, permissions);
	}

	public canChangeDueDate(issueData, userJob, permissions) {
		return (this.isAdmin(permissions) || this.isJobOwner(issueData, userJob, permissions)) &&
			this.canComment(issueData, userJob, permissions);
	}

	public canChangeAssigned(issueData, userJob, permissions) {
		return (this.isAdmin(permissions) ||
			this.isJobOwner(issueData, userJob, permissions) ||
			this.isAssignedJob(issueData, userJob, permissions)) &&
			this.canComment(issueData, userJob, permissions);
	}

	public isOpen(issueData) {
		if (issueData) {
			return issueData.status !== 'closed';
		}
		return false;
	}

	/**
	 * user can comment if they are a commenter/collaborator,
	 * or if they have the same job as the issue owner (but not a viewer)
	 * or if they are the issue owner (but not a viewer),
	 * and the issue is not closed
	 */
	public canComment(issueData, userJob, permissions) {

		const isNotClosed = issueData &&
			issueData.status &&
			this.isOpen(issueData);

		const ableToComment = this.isAdmin(permissions) ||
			this.isJobOwner(issueData, userJob, permissions) ||
			this.authService.hasPermission(
				this.clientConfigService.permissions.PERM_COMMENT_ISSUE,
				permissions
			);

		return ableToComment && isNotClosed;

	}

	public deselectPin(issue) {
		// Issue with position means pin
		if (issue.position.length > 0 && issue._id) {
			this.viewerService.changePinColours({
				id: issue._id,
				colours: Pin.pinColours.blue
			});
		}
	}

	public generateTitle(issue) {
		if (issue.modelCode) {
			return issue.modelCode + '.' + issue.number + ' ' + issue.name;
		} else if (issue.typePrefix) {
			return issue.typePrefix + '.' + issue.number + ' ' + issue.name;
		} else {
			return issue.number + ' ' + issue.name;
		}
	}

	public getThumbnailPath(thumbnailUrl) {
		return this.apiService.getAPIUrl(thumbnailUrl);
	}

	public toggleCloseIssue(issue) {
		let closed = true;
		if (issue.hasOwnProperty('closed')) {
			closed = !issue.closed;
		}
		return this.doPut(issue, {
			closed,
			number: issue.number
		});
	}

	public assignIssue(issue) {
		return this.doPut(
			issue,
			{
				assigned_roles: issue.assigned_roles,
				number: 0 // issue.number
			}
		);
	}

	public saveComment(issue, comment, viewpoint) {
		return this.doPut(issue, {
			comment,
			viewpoint
		});
	}

	public editComment(issue, comment, commentIndex) {
		return this.doPut(issue, {
			comment,
			number: issue.number,
			edit: true,
			commentIndex
		});
	}

	public deleteComment(issue, index) {
		return this.doPut(issue, {
			comment: '',
			number: issue.number,
			delete: true,
			commentIndex: index
			// commentCreated: issue.comments[index].created
		});
	}

	public sealComment(issue, commentIndex) {
		return this.doPut(issue, {
			comment: '',
			number: issue.number,
			sealed: true,
			commentIndex
		});
	}

	/**
	 * Convert an action comment to readable text
	 * @param comment
	 * @returns {string}
	 */
	public convertActionCommentToText(comment, topicTypes) {
		let text = '';

		if (comment) {
			switch (comment.action.property) {
			case 'priority':

				comment.action.propertyText = 'Priority';
				comment.action.from = this.convertActionValueToText(comment.action.from);
				comment.action.to = this.convertActionValueToText(comment.action.to);
				break;

			case 'status':

				comment.action.propertyText = 'Status';
				comment.action.from = this.convertActionValueToText(comment.action.from);
				comment.action.to = this.convertActionValueToText(comment.action.to);
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
	}

	/**
	 * generate title, screenshot path and comment for an issue
	 * @param issue
	 * @returns issue
	 */
	public cleanIssue(issue: any) {

		issue.title = this.generateTitle(issue);

		if (issue.hasOwnProperty('comments')) {
			for (let j = 0, numComments = issue.comments.length; j < numComments; j++) {
				// Action comment text
				if (issue.comments[j].action) {
					issue.comments[j].comment = this.convertActionCommentToText(issue.comments[j], undefined);
				}
				// screen shot path
				if (issue.comments[j].viewpoint && issue.comments[j].viewpoint.screenshot) {
					issue.comments[j].viewpoint.screenshotPath = this.apiService.getAPIUrl(issue.comments[j].viewpoint.screenshot);
				}
			}
		}

		return issue;
	}

	/**
	 * Convert an action value to readable text
	 * @param value
	 */
	public convertActionValueToText(value: string) {
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
	}

}

export const IssuesServiceModule = angular
	.module('3drepo')
	.service('IssuesService', IssuesService);

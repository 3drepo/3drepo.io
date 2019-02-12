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
		this.reset();
		this.pin = {
			pinDropMode: null
		};
		this.newPinId = 'newPinId';
	}

	public handlePickPointEvent(event, account, model) {

		if (
			event.value.hasOwnProperty('id') &&
			this.pin.pinDropMode
		) {

			this.removeUnsavedPin();

			const trans = event.value.trans;
			let position = event.value.position;
			const normal = event.value.normal;

			if (trans) {
				position = trans.inverse().multMatrixPnt(position);
			}

			const data = {
				account,
				colours: event.value.selectColour,
				id: this.newPinId,
				type: 'issue',
				model,
				pickedNorm: normal,
				pickedPos: position,
				selectedObjectId: event.value.id
			};

			Viewer.addPin(data);
			Viewer.setPin({data});
		}
	}

	public reset() {
		this.groupsCache = {};
		this.state = {
			heights : {
				infoHeight : 135,
				issuesListItemHeight : 141
			},
			selectedIssue: null,
			allIssues: [],
			issuesToShow: [],
			displayIssue: null,
			issueDisplay: {
				showSubModelIssues: false,
				showClosed: false,
				sortOldestFirst : false,
				excludeRoles: []
			},
			availableJobs : [],
			allTopicTypes : [],
			allJobs: [],
			modelUserJob: null
		};
		this.removeUnsavedPin();
	}

	public getIssuesAndJobs(account: string, model: string, revision: string) {
		return Promise.all([
			this.getUserJobForModel(account, model),
			this.getTeamspaceJobs(account, model)
		]).then(() => {
			return this.getIssuesData(account, model, revision);
		});
	}

	public getIssuesData(account: string, model: string, revision: string) {
		return this.getIssues(account, model, revision)
			.then((newIssues) => {
				if (newIssues) {
					newIssues.forEach(this.populateIssue.bind(this));
					this.state.allIssues = newIssues;

					const newJobs: any = {};
					const newTopicTypes: any = {};
					newIssues.forEach( (i) =>  {
						if (i.creator_role) {
							newJobs[i.creator_role] = true;
						}

						if (i.topic_type) {
							newTopicTypes[i.topic_type] = true;
						}

						i.assigned_roles.forEach( (r) => newJobs[r] = true);
					});

					const jobs = Object.keys(newJobs).map( (j) => ({_id : j }));
					this.addJobsToAllJobs(jobs);

					const toPascal = (w) => w.split('_').map( (ws) => ws[0].toUpperCase() + ws.substring(1)).join(' ');
					const topicTypes = Object.keys(newTopicTypes).map( (t) => ({ value: t , label : toPascal(t)} )) ;

					this.addToAllTypes(topicTypes);

				} else {
					throw new Error('Error');
				}

			});

	}

	public getTeamspaceJobs(account: string, model: string): Promise<any[]> {
		const url = account + '/jobs';

		return this.apiService.get(url)
			.then((response) => {
				this.state.availableJobs = response.data;
				this.addJobsToAllJobs(response.data);
				return this.state.availableJobs;
			});
	}

	public addJobsToAllJobs(jobs: any[]) {
		const newJobs = jobs.filter((r) => !this.state.allJobs.find( (j) => j._id === r._id ));
		this.state.allJobs = this.state.allJobs.concat(newJobs).sort( (a, b) => a._id > b._id ? 1 : -1);

		const menuChips =  this.state.allJobs.map((role) => ({
			value: role._id,
			label: role._id
		}));

		const assignedMenu = menuChips.concat([{value: null, label: 'Unassigned'}]);

		this.panelService.setChipFilterMenuItem('issues', {label: 'Created by', value: 'creator_role'}, menuChips);
		this.panelService.setChipFilterMenuItem('issues', {label: 'Assigned to', value: 'assigned_roles'}, assignedMenu);
	}

	public addToAllTypes(topicTypes: any) {
		const newTopicsTypes = topicTypes.filter((r) => !this.state.allTopicTypes.find( (j) => j.value === r.value ));

		this.state.allTopicTypes = this.state.allTopicTypes.concat(newTopicsTypes)
									.sort( (a, b) => a.label > b.label ? 1 : -1);

		this.panelService.setChipFilterMenuItem('issues', {label: 'Type', value: 'topic_type'}, topicTypes);
	}

	public getUserJobForModel(account: string, model: string): Promise<any> {
		const url = account + '/myJob';

		return this.apiService.get(url)
			.then((response) => {
				this.state.modelUserJob = response.data;
				return this.state.modelUserJob;
			});
	}

	public createBlankIssue(creatorRole) {
		return {
			creator_role: creatorRole,
			priority: 'none',
			status: 'open',
			assigned_roles: [],
			topic_type: 'for_information',
			viewpoint: {}
		};
	}

	public getDisplayIssue() {
		if (this.state.displayIssue && this.state.allIssues.length > 0) {
			const issueToDisplay = [...this.state.allIssues].find((issue) => {
				return issue._id === this.state.displayIssue;
			});

			return issueToDisplay;

		}
		return false;
	}

	public setFromDateMenuValue(date: Date) {
		this.panelService.setDateValueFromMenu('issues', 'date', 'from', date);
	}

	public setToDateMenuValue(date: Date) {
		this.panelService.setDateValueFromMenu('issues', 'date', 'to', date);
	}

	public setupIssuesToShow(model: string, chips: IChip[] ) {
		this.state.issuesToShow = [];

		if (this.state.allIssues.length > 0) {
			const filteredIssues = this.filterIssues(model, this.state.allIssues, chips) ;
			const sortOldest = this.state.issueDisplay.sortOldestFirst;
			filteredIssues.sort((a, b) => {
				return sortOldest ? a.created - b.created : b.created - a.created;
			});
			this.state.issuesToShow = filteredIssues;
		}
	}

	public filterIssues(model: string, issues: any[], chips: IChip[]): any[] {
		let filters = [];
		const criteria = this.getCriteria(chips);

		if (!criteria.status) { // If there is no explicit filter for status dont show closed issues
									// thats the general criteria for showing issues.
			filters.push((issue) => issue.status !== 'closed');
		}

		filters = filters.concat(this.getOrClause(criteria.notification, this.filterNotification));

		filters = filters.concat(this.getOrClause(criteria[''], this.handleIssueFilter));

		filters = filters.concat(this.createFilterByField(criteria, 'priority'));

		filters = filters.concat(this.createFilterByField(criteria, 'creator_role'));

		filters = filters.concat(this.createFilterByField(criteria, 'status'));

		filters = filters.concat(this.getOrClause(criteria.assigned_roles, this.filterAssignedRoles));

		filters = filters.concat(this.createFilterByField(criteria, 'topic_type'));

		if (!this.state.issueDisplay.showSubModelIssues) {
			filters.push((issue) => issue.model === model);
		}

		if (criteria.date_from) {
			filters.push((issue) => issue.created >= criteria.date_from[0].getTime());
		}

		if (criteria.date_to) {
			//  86399000 is 23:59:59 in milliseconds
			filters.push((issue) => issue.created <= criteria.date_to[0].getTime() + 86399000 );
		}

		// It filters the issue list by applying every filter to it.
		const filteredIssues = issues.filter( (issue) => filters.every( (f) => f(issue)));
		return filteredIssues;
	}

	public createFilterByField(criteria: any, field: string) {
		return this.getOrClause(criteria[field], this.filterByField.bind(this, field));
	}

	public getCriteria(chips: IChip[]): any {
		const initialValue = {};

		return  chips.reduce((object, currVal) => {
			if (!object[currVal.type]) {
				object[currVal.type] = [];
			}

			object[currVal.type].push(currVal.value);
			return object;
		}, initialValue);
	}

	/** filters */

	public getAndClause(tags: any[], comparator) {
		if ((tags || []).length === 0) {
			return[];
		}
		return [(value, index, array) => tags.every( comparator.bind(this, value) )];
	}

	public getOrClause(tags: any[], comparator) {
		if ((tags || []).length === 0) {
			return[];
		}

		return [(value, index, array) => tags.some( comparator.bind(this, value) )];
	}

	public filterByField(field, issue, tag): boolean {
		if (Array.isArray(issue[field])) {
			return issue[field].indexOf(tag) >= 0;
		}

		return issue[field] === tag;
	}

	public filterAssignedRoles(issue, tag): boolean {
		if (!tag) {
			return issue.assigned_roles.length === 0;
		}
		return this.filterByField('assigned_roles', issue, tag);
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

	/****/

	public resetSelectedIssue() {
		this.state.selectedIssue = undefined;
		// showIssuePins();
	}

	public isSelectedIssue(issue) {
		if (!this.state.selectedIssue || !this.state.selectedIssue._id) {
			return false;
		} else {
			return issue._id === this.state.selectedIssue._id;
		}
	}

	public showIssuePins() {

		// TODO: This is still inefficent and unclean
		this.state.allIssues.forEach((issue) => {
			const show = this.state.issuesToShow.find((shownIssue) => {
				return issue._id === shownIssue._id;
			});

			// Check that there is a position for the pin
			const pinPosition = issue.position && issue.position.length;

			if (show !== undefined && pinPosition) {

				let pinColor = Pin.pinColours.blue;
				const isSelectedPin = this.state.selectedIssue &&
									issue._id === this.state.selectedIssue._id;

				if (isSelectedPin) {
					pinColor = Pin.pinColours.yellow;
				}

				this.viewerService.addPin({
					id: issue._id,
					account: issue.account,
					model: issue.model,
					pickedPos: issue.position,
					pickedNorm: issue.norm,
					colours: pinColor,
					viewpoint: issue.viewpoint
				});

			} else {
				// Remove pin
				this.viewerService.removePin({ id: issue._id });
			}
		});

	}

	public setSelectedIssue(issue, isCorrectState, revision) {

		if (this.state.selectedIssue) {
			const different = (this.state.selectedIssue._id !== issue._id);
			if (different) {
				this.deselectPin(this.state.selectedIssue);
			}
		}

		this.state.selectedIssue = issue;

		// If we're saving then we already have pin and
		// highlights in place
		if (!isCorrectState) {
			this.showIssuePins();
			this.showIssue(issue, revision);
		}

	}

	public addIssue(issue) {
		this.populateIssue(issue);
		this.state.allIssues.unshift(issue);
	}

	public updateIssues(issue) {

		this.populateIssue(issue);

		this.state.allIssues.forEach((oldIssue, i) => {
			const matches = oldIssue._id === issue._id && issue.model === oldIssue.model;
			if (matches) {

				if (issue.status === 'closed') {

					this.state.allIssues[i].justClosed = true;

					this.$timeout(() => {

						this.state.allIssues[i] = issue;

					}, 4000);

				} else {
					this.state.allIssues[i] = issue;
				}

			}
		});
	}

	public populateIssue(issue) {

		if (issue) {
			issue.title = this.generateTitle(issue);
			issue.statusIcon = this.getStatusIcon(issue);

			if (issue.thumbnail) {
				issue.thumbnailPath = this.getThumbnailPath(issue.thumbnail);
			}

			if (issue.due_date) {
				issue.due_date = new Date(issue.due_date);
			}
			if (issue.assigned_roles[0]) {
				issue.issueRoleColor = this.getJobColor(issue.assigned_roles[0]);
			}

			if (!issue.descriptionThumbnail) {
				if (issue.viewpoint && issue.viewpoint.screenshotSmall && issue.viewpoint.screenshotSmall !== 'undefined') {
					issue.descriptionThumbnail = this.apiService.getAPIUrl(issue.viewpoint.screenshotSmall);
				}
			}
		}
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

	public showIssue(issue, revision) {
		this.showIssuePins();

		// Remove highlight from any multi objects
		this.viewerService.highlightObjects([]);
		this.treeService.clearCurrentlySelected();

		// Reset object visibility
		if (issue.viewpoint && issue.viewpoint.hasOwnProperty('hideIfc')) {
			this.treeService.setHideIfc(issue.viewpoint.hideIfc);
		}

		const hasHiddenOrShownGroup = issue.viewpoint && (
			issue.viewpoint.hasOwnProperty('hidden_group_id') ||
			issue.viewpoint.hasOwnProperty('shown_group_id'));

		this.treeService.showAllTreeNodes(!hasHiddenOrShownGroup);

		// Show multi objects
		if ((issue.viewpoint && (issue.viewpoint.hasOwnProperty('highlighted_group_id') ||
						issue.viewpoint.hasOwnProperty('group_id'))) ||
						issue.hasOwnProperty('group_id') ||
						hasHiddenOrShownGroup
		) {

			this.showMultiIds(issue, revision).then(() => {
				this.handleShowIssue(issue);
			});

		} else {
			this.handleShowIssue(issue);
		}

	}

	public handleCameraView(issue) {
		// Set the camera position
		const issueData = {
			position : issue.viewpoint.position,
			view_dir : issue.viewpoint.view_dir,
			look_at : issue.viewpoint.look_at,
			up: issue.viewpoint.up,
			account: issue.account,
			model: issue.model
		};

		this.viewerService.setCamera(issueData);

	}

	public handleShowIssue(issue) {

		if (issue && issue.viewpoint ) {

			if (issue.viewpoint.position && issue.viewpoint.position.length > 0) {
				this.handleCameraView(issue);
			}

			const issueData = {
				clippingPlanes: issue.viewpoint.clippingPlanes,
				account: issue.account,
				model: issue.model
			};

			this.viewerService.updateClippingPlanes(issueData);

		} else {
			// This issue does not have a viewpoint, go to default viewpoint
			this.viewerService.goToExtent();
		}
	}

	public showMultiIds(issue, revision) {

		const promises = [];

		if (issue.viewpoint && (issue.viewpoint.hasOwnProperty('highlighted_group_id') ||
					issue.viewpoint.hasOwnProperty('hidden_group_id') ||
					issue.viewpoint.hasOwnProperty('shown_group_id'))) {

			if (issue.viewpoint.hidden_group_id) {

				const hiddenGroupId = issue.viewpoint.hidden_group_id;
				let hiddenGroupUrl;
				if (revision) {
					hiddenGroupUrl = `${issue.account}/${issue.model}/groups/revision/${revision}/${hiddenGroupId}`;
				} else {
					hiddenGroupUrl = `${issue.account}/${issue.model}/groups/revision/master/head/${hiddenGroupId}`;
				}

				let hiddenPromise;

				if (this.groupsCache[hiddenGroupUrl]) {
					hiddenPromise = this.handleHidden(this.groupsCache[hiddenGroupUrl]);
				} else {

					hiddenPromise = this.apiService.get(hiddenGroupUrl)
						.then((response) => {
							this.groupsCache[hiddenGroupUrl] = response.data.objects;
							return this.handleHidden(response.data.objects);
						})
						.catch((error) => {
							console.error('There was a problem getting visibility: ', error);
						});

				}

				promises.push(hiddenPromise);

			}

			if (issue.viewpoint.shown_group_id) {

				const shownGroupId = issue.viewpoint.shown_group_id;
				let shownGroupUrl;
				if (revision) {
					shownGroupUrl = issue.account + '/' + issue.model + '/groups/revision/' + revision + '/' + shownGroupId;
				} else {
					shownGroupUrl = issue.account + '/' + issue.model + '/groups/revision/master/head/' + shownGroupId;
				}

				let shownPromise;

				if (this.groupsCache[shownGroupUrl]) {
					shownPromise = this.handleShown(this.groupsCache[shownGroupUrl]);
				} else {

					shownPromise = this.apiService.get(shownGroupUrl)
						.then( (response) => {
							this.groupsCache[shownGroupUrl] = response.data.objects;
							return this.handleShown(response.data.objects);
						})
						.catch((error) => {
							console.error('There was a problem getting visibility: ', error);
						});
				}

				promises.push(shownPromise);
			}

			if (issue.viewpoint.highlighted_group_id) {

				const highlightedGroupId = issue.viewpoint.highlighted_group_id;
				let highlightedGroupUrl;
				if (revision) {
					highlightedGroupUrl = `${issue.account}/${issue.model}/groups/revision/${revision}/${highlightedGroupId}`;
				} else {
					highlightedGroupUrl = `${issue.account}/${issue.model}/groups/revision/master/head/${highlightedGroupId}`;
				}

				let highlightPromise;

				if (this.groupsCache[highlightedGroupUrl]) {
					highlightPromise = this.handleHighlights(this.groupsCache[highlightedGroupUrl]);
				} else {

					highlightPromise = this.apiService.get(highlightedGroupUrl)
						.then((response) => {
							this.groupsCache[highlightedGroupUrl] = response.data.objects;
							return this.handleHighlights(response.data.objects);
						})
						.catch((error) => {
							console.error('There was a problem getting the highlights: ', error);
						});

				}

				promises.push(highlightPromise);
			}

		} else {

			const hasGroup = (issue.viewpoint && issue.viewpoint.hasOwnProperty('group_id'));
			const groupId = hasGroup ? issue.viewpoint.group_id : issue.group_id;
			let groupUrl;
			if (revision) {
				groupUrl = issue.account + '/' + issue.model + '/groups/revision/' + revision + '/' + groupId;
			} else {
				groupUrl = issue.account + '/' + issue.model + '/groups/revision/master/head/' + groupId;
			}

			let handleTreePromise;

			if (this.groupsCache[groupUrl]) {
				handleTreePromise = this.handleTree(this.groupsCache[groupUrl]);
			} else {

				handleTreePromise = this.apiService.get(groupUrl)
					.then((response) => {
						if (response.data.hiddenObjects && response.data.hiddenObjects && !issue.viewpoint.hasOwnProperty('group_id')) {
							response.data.hiddenObjects = null;
						}
						this.groupsCache[groupId] = response;
						return this.handleTree(response);
					})
					.catch((error) => {
						console.error('There was a problem getting the highlights: ', error);
					});

			}

			promises.push(handleTreePromise);

		}

		return Promise.all(promises);

	}

	public handleHighlights(objects) {
		this.treeService.selectedIndex = undefined; // To force a watcher reset (if its the same object)
		this.$timeout(() => {
		this.treeService.selectNodesBySharedIds(objects)
			.then(() => {
				angular.element((window as any)).triggerHandler('resize');
			});
		});
	}

	public handleHidden(objects) {
		this.treeService.hideNodesBySharedIds(objects);
	}

	public handleShown(objects) {
		this.treeService.isolateNodesBySharedIds(objects);
	}

	public handleTree(response) {

		if (response.data.hiddenObjects) {
			this.handleHidden(response.data.hiddenObjects);
		}

		if (response.data.shownObjects) {
			this.handleShown(response.data.shownObjects);
		}

		if (response.data.objects && response.data.objects.length > 0) {
			this.handleHighlights(response.data.objects);
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

	public getIssue(account, model, issueId) {

		const issueUrl = account + '/' + model + '/issues/' + issueId + '.json';

		return this.apiService.get(issueUrl)
			.then((res) => {
				res.data = this.cleanIssue(res.data);
				return res.data;
			});

	}

	public getIssues(account, model, revision) {

		let endpoint;
		if (revision) {
			endpoint = account + '/' + model + '/revision/' + revision + '/issues.json';
		} else {
			endpoint = account + '/' + model + '/issues.json';
		}

		return this.apiService.get(endpoint)
			.then((response) => {
				const issuesData = response.data;
				for (let i = 0; i < response.data.length; i ++) {
					this.populateIssue(issuesData[i]);
				}
				return response.data;
			});
	}

	public saveIssue(issue) {

		let saveUrl;
		const base = issue.account + '/' + issue.model;
		if (issue.rev_id) {
			saveUrl = base + '/revision/' + issue.rev_id + '/issues.json';
		} else {
			saveUrl = base + '/issues.json';
		}

		const config = {withCredentials: true};

		if (issue.pickedPos !== null) {
			issue.position = issue.pickedPos;
			issue.norm = issue.pickedNorm;
		}

		return this.apiService.post(saveUrl, issue, config);

	}

	/**
	 * Update issue
	 * @param issue
	 * @param issueData
	 * @returns {*}
	 */
	public updateIssue(issue, issueData) {
		return this.doPut(issue, issueData);
	}

	/**
	 * Handle PUT requests
	 * @param issue
	 * @param putData
	 * @returns {*}
	 */
	public doPut(issue, putData) {

		let endpoint = issue.account + '/' + issue.model;

		if (issue.rev_id) {
			endpoint += '/revision/' + issue.rev_id + '/issues/' +  issue._id + '.json';
		} else {
			endpoint += '/issues/' + issue._id + '.json';
		}

		return this.apiService.put(endpoint, putData);
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

	public hexToRgb(hex) {
		// If nothing comes end, then send nothing out.
		if (!hex) {
			return undefined;
		}

		let hexColours = [];

		if (hex.charAt(0) === '#') {
			hex = hex.substr(1);
		}

		if (hex.length === 6) {
			hexColours.push(hex.substr(0, 2));
			hexColours.push(hex.substr(2, 2));
			hexColours.push(hex.substr(4, 2));
		} else if (hex.length === 3) {
			hexColours.push(hex.substr(0, 1) + hex.substr(0, 1));
			hexColours.push(hex.substr(1, 1) + hex.substr(1, 1));
			hexColours.push(hex.substr(2, 1) + hex.substr(2, 1));
		} else {
			hexColours = ['00', '00', '00'];
		}

		return [
			(parseInt(hexColours[0], 16) / 255.0),
			(parseInt(hexColours[1], 16) / 255.0),
			(parseInt(hexColours[2], 16) / 255.0)
		];
	}

	public getJobColor(id) {
		let roleColor = '#ffffff';
		let found = false;
		if (id && this.state.availableJobs) {
			for (let i = 0; i <  this.state.availableJobs.length; i ++) {
				const job =  this.state.availableJobs[i];
				if (job._id === id && job.color) {
					roleColor = job.color;
					found = true;
					break;
				}
			}
		}
		if (!found) {
			console.debug('Job color not found for', id);
		}
		return roleColor;
	}

	/**
	 * Set the status icon style and colour
	 */
	public getStatusIcon(issue) {

		const statusIcon: any = {};

		switch (issue.priority) {
		case 'none':
			statusIcon.colour = '#7777777';
			break;
		case 'low':
			statusIcon.colour = '#4CAF50';
			break;
		case 'medium':
			statusIcon.colour = '#FF9800';
			break;
		case 'high':
			statusIcon.colour = '#F44336';
			break;
		}

		switch (issue.status) {
		case 'open':
			statusIcon.icon = 'panorama_fish_eye';
			break;
		case 'in progress':
			statusIcon.icon = 'lens';
			break;
		case 'for approval':
			statusIcon.icon = 'adjust';
			break;
		case 'closed':
			statusIcon.icon = 'check_circle';
			statusIcon.colour = '#0C2F54';
			break;
		}

		return statusIcon;
	}

	public setPinDropMode(on: boolean) {
		this.pin.pinDropMode = on;
		this.viewerService.pin.pinDropMode = on;

		if (on) {
			this.multiSelectService.toggleAreaSelect(false);
		}
	}

	public removeUnsavedPin() {
		this.viewerService.removePin({id: this.newPinId });
		this.viewerService.setPin({data: null});
	}

	/**
	* Import bcf
	*/
	public importBcf(account, model, revision, file) {

		let bcfUrl = account + '/' + model + '/issues.bcfzip';
		if (revision) {
			bcfUrl = account + '/' + model + '/revision/' + revision + '/issues.bcfzip';
		}

		const formData = new FormData();
		formData.append('file', file);

		return this.apiService.post(bcfUrl, formData, {'Content-Type': undefined})
			.then((res) => {
				if (res.status !== 200) {
					throw res.data;
				}
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

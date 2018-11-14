/**
 *	Copyright (C) 2018 3D Repo Ltd
 *
 *	This program is free software: you can redistribute it and/or modify
 *	it under the terms of the GNU Affero General Public License as
 *	published by the Free Software Foundation, either version 3 of the
 *	License, or (at your option) any later version.
 *
 *	This program is distributed in the hope that it will be useful,
 *	but WITHOUT ANY WARRANTY; without even the implied warranty of
 *	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *	GNU Affero General Public License for more details.
 *
 *	You should have received a copy of the GNU Affero General Public License
 *	along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

export class GroupsService {

	public static $inject: string[] = [
		'$q',
		'$timeout',
		'APIService',
		'TreeService',
		'MultiSelectService',
		'AuthService',
		'ViewerService'
	];

	public state;

	constructor(
		private $q: ng.IQService,
		private $timeout: any,
		private APIService: any,
		private TreeService: any,
		private MultiSelectService: any,
		private AuthService: any,
		private ViewerService: any
	) {
		this.reset();
	}

	/**
	 * Reset the data model
	 */
	public reset() {
		this.state = {
			groups: [],
			selectedGroup: {},
			colorOverride: {},
			totalSelectedMeshes: 0,
			multiSelectedGroups: [],
			overrideAll: false
		};
	}

	/**
	 * Initialise the groups state from the backend
	 */
	public initGroups(teamspace, model, revision) {
		return this.getGroups(teamspace, model, revision)
			.then((groups) => {
				this.state.groups = groups;
				this.cleanGroups(this.state.groups);
			});
	}

	/**
	 * Filter groups using @param searchQuery
	 */
	public groupsFilterSearch(searchQuery: string): any[] {
		return this.state.groups.filter((group) => {
			const toKeep = this.stringSearch(group.name, searchQuery)
				|| this.stringSearch(group.description, searchQuery)
				|| this.stringSearch(group.author, searchQuery);

			if (!toKeep) {
				this.unhighlightGroup(group);
			}
			return toKeep;
		});
	}
	/**
	 * Check if a group is currently color overriden
	 * @param group the group to check
	 */
	public hasColorOverride(group: any): boolean {
		return this.state.colorOverride[group._id] !== undefined;
	}

	/**
	 * Toggle the color over ride of a group
	 * @param group the group to toggle
	 */
	public toggleColorOverride(group: any) {
		if (this.hasColorOverride(group)) {
			this.removeColorOverride(group._id);
		} else {
			this.colorOverride(group);
		}
	}

	/**
	 * Override all groups
	 */
	public colorOverrideAllGroups(on: boolean) {
		this.state.overrideAll = on;
		this.state.groups.forEach((group) => {
			if (on) {
				this.colorOverride(group);
			} else {
				this.removeColorOverride(group._id);
			}
		});
	}

	/**
	 * Color override the meshes of a given group
	 * @param group the group to color override
	 */
	public colorOverride(group: any) {

		const color = group.color.map((c) => c / 255);

		this.TreeService.getMap().then((treeMap) => {

			// Convert shared IDs to unique IDs
			this.TreeService.getNodesFromSharedIds(group.objects).then((nodes) => {
				// Remove any undefined nodes
				nodes = nodes.filter((n) => n !== undefined);

				// Create a map of meshes
				// for the colour overiding
				const meshes = this.TreeService.getMeshMapFromNodes(nodes);

				for (const key in meshes) {
					if (key) {
						const meshIds = meshes[key].meshes;
						const pair = key.split('@');
						const modelAccount = pair[0];
						const modelId = pair[1];

						this.ViewerService.overrideMeshColor(modelAccount, modelId, meshIds, color);
					}
				}

				this.state.colorOverride[group._id] = {
					models: meshes, color
				};
			});
		});
	}

	/**
	 * Remove all color overrides from a given group based on it's ID
	 */
	public removeColorOverride(groupId: string, shouldDisableOverrideAll: boolean = true) {

		const group = this.state.colorOverride[groupId];

		if (group) {
			for (const key in group.models) {

				if (group.models.hasOwnProperty(key)) {
					const meshIds = group.models[key].meshes;
					const pair = key.split('@');
					const account = pair[0];
					const model = pair[1];

					this.ViewerService.resetMeshColor(
						account,
						model,
						meshIds,
						group.color
					);
				}
			}

			delete this.state.colorOverride[groupId];

			if (shouldDisableOverrideAll && this.state.overrideAll &&
				this.state.groups.length !==
				Object.keys(this.state.colorOverride).length) {
				this.state.overrideAll = false;
			}
		}
	}

	/**
	 * Reselect a group
	 */
	public reselectGroup(group) {
		this.selectGroup(group);
	}

	/**
	 * Return all the meshes for all currently highlighted objects
	 */
	public getCurrentMeshHighlights() {

		return this.TreeService.getCurrentMeshHighlights().then((objects) => {

			let total = 0;
			for (const key in objects) {
				if (objects[key] && objects[key].meshes) {
					total += objects[key].meshes.length;
				}
			}
			return total;
		});
	}

	/**
	 * Return a default group name, incrementing upwards
	 */
	public getDefaultGroupName(groups) {
		const groupNames = [];
		groups.forEach((group) => {
			groupNames.push(group.name);
		});

		const prefix = 'Group ';
		let num = 1;

		while (groupNames.indexOf(prefix + num) !== -1) {
			num++;
		}

		return prefix + num;
	}

	/**
	 * Set the color of the selected group to a given color
	 */
	public setSelectedGroupColor(color) {
		this.state.selectedGroup.color = color;
	}

	/**
	 * Return an CSS friendly RGBA color from an array
	 */
	public getRGBA(color) {
		const red = parseInt(color[0], 10);
		const blue = parseInt(color[1], 10);
		const green = parseInt(color[2], 10);
		return `rgba(${red}, ${blue}, ${green}, 1)`;
	}

	/**
	 * Return an CSS friendly RGBA for a given group
	 */
	public getGroupRGBAColor(group) {
		if (group && group.color) {
			return this.getRGBA(group.color);
		}

		return 'rgba(255, 255, 255, 1)';
	}

	/**
	 * Return a random RGB color array i.e. [255, 255, 255]
	 */
	public getRandomColor(): number[] {
		return [
			parseInt((Math.random() * 255).toFixed(0), 10),
			parseInt((Math.random() * 255).toFixed(0), 10),
			parseInt((Math.random() * 255).toFixed(0), 10)
		];
	}

	/**
	 * Convert a colour from hex to an RGBA value
	 */
	public hexToRGBA(hex: string, alpha?: number) {

		alpha = (alpha !== undefined) ? alpha : 1;

		// Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
		const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
		hex = hex.replace(shorthandRegex, (m, r, g, b) => {
			return r + r + g + g + b + b;
		});

		const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		return result ? [
			parseInt(result[1], 16),
			parseInt(result[2], 16),
			parseInt(result[3], 16)
		] : [];

	}

	/**
	 * Do any cleaning that's necessary for groups in the UI
	 */
	public cleanGroups(groups: any[]) {
		groups.forEach((group) => {
			if (!group.name) {
				group.name = '(No assigned name)';
			}
		});
	}

	/**
	 * Isolate a group in the viewer
	 * @param group the group to isolate
	 */
	public isolateGroup(group: any) {
		this.clearSelectionHighlights();
		this.TreeService.isolateNodesBySharedIds(group.objects);
	}

	public clearSelectionHighlights() {
		this.state.groups.forEach((group) => {
			group.highlighted = false;
			group.focus = false;
		});
		this.TreeService.clearCurrentlySelected();
	}

	/**
	 * Deletes highlighted groups in the current model
	 * @param teamspace the teamspace name for the group
	 * @param model the model id for the group
	 */
	public deleteHighlightedGroups(teamspace: string, model: string) {
		const groupsToDelete = this.state.groups.filter((g) => g.highlighted);
		return this.deleteGroups(teamspace, model, groupsToDelete);
	}

	/**
	 * Deletes all groups in the current model
	 * @param teamspace the teamspace name for the group
	 * @param model the model id for the group
	 */
	public deleteAllGroups(teamspace: string, model: string) {
		return this.deleteGroups(teamspace, model, [].concat(this.state.groups));
	}

	/**
	 * Deletes an array of groups in the backend
	 * @param teamspace the teamspace name for the group
	 * @param model the model id for the group
	 * @param groups the groups array to delete
	 */
	public deleteGroups(teamspace: string, model: string, groups: any) {
		if (groups.length > 0) {
			const groupsUrl = `${teamspace}/${model}/groups/?ids=${groups.map((group) => group._id).join(',')}`;
			return this.APIService.delete(groupsUrl)
				.then((response) => {
					groups.forEach(this.deleteStateGroup.bind(this));
					return response;
				});
		} else {
			return Promise.resolve();
		}
	}

	/**
	 * Deselects the objects from a particular group
	 * @param group the group that contains the objects I wish to deselect
	 */
	public deselectObjectsFromGroup(group: any) {
		this.TreeService.getNodesFromSharedIds(group.objects).then((nodes) => {
			this.TreeService.deselectNodes(nodes);
		});
	}

	/**
	 * Select a group
	 * @param group the group to select
	 */
	public selectGroup(group: any) {
		const addGroup = this.MultiSelectService.isAccumMode();
		const removeGroup = this.MultiSelectService.isDecumMode();
		const multiSelect = addGroup || removeGroup;

		if (!multiSelect) {
			this.state.multiSelectedGroups = [];
			this.clearSelectionHighlights();
		}

		if (removeGroup) {
			this.unhighlightGroup(group);
		} else {
			this.focus(group);
			this.highlightGroup(group);
		}
	}

	public getObjectsStatus() {
		const objectsDefer = this.$q.defer();

		// Get selected objects
		this.ViewerService.getObjectsStatus({
			promise: objectsDefer
		});
		return objectsDefer.promise;
	}

	public getTotalMeshes() {
		return this.getObjectsStatus().then((objectsStatus: any) => {
			return (objectsStatus.highlightedNodes && objectsStatus.highlightedNodes.length > 0) ?
				objectsStatus.highlightedNodes
					.map((x) => x.shared_ids.length)
					.reduce((acc, val) => acc + val) : 0;
		});
	}

	public updateSelectedObjectsLen() {
		return this.getTotalMeshes().then((totalMeshes) => {
			this.state.selectedObjectsLen = totalMeshes;
			return totalMeshes;
		});
	}

	public setTotalSavedMeshes(group) {
		this.getTotalMeshes().then((totalMeshes) => {
			group.totalSavedMeshes = totalMeshes;
		});
	}

	/**
	 * Generate a placeholder object for a new group
	 */
	public generateNewGroup(): any {
		return this.getSelectedObjects().then((objects) => {

			this.TreeService.selectNodesBySharedIds(
				objects
			);

			this.focus({
				new: true,
				createdAt: Date.now(),
				updatedAt: Date.now(),
				updatedBy: this.AuthService.getUsername(),
				author: this.AuthService.getUsername(),
				description: '',
				name: this.getDefaultGroupName(this.state.groups),
				color: this.getRandomColor(),
				objects,
				totalSavedMeshes: 0
			});
		});
	}

	/**
	 * Get the selected objects fit for sending to the backend
	 */
	public getSelectedObjects() {
		return this.getObjectsStatus().then((objects: any) => {
			return objects.highlightedNodes;
		});
	}

	/**
	 * Get the groups from the backend
	 */
	public getGroups(teamspace: string, model: string, revision: string) {
		let groupUrl;
		if (revision) {
			groupUrl = `${teamspace}/${model}/groups/revision/${revision}/?noIssues=true&noRisks=true`;
		} else {
			groupUrl = `${teamspace}/${model}/groups/revision/master/head/?noIssues=true&noRisks=true`;
		}

		return this.APIService.get(groupUrl)
			.then((response) => {
				this.state.groups = response.data;
			});
	}

	/**
	 * Update a group in the backend
	 * @param teamspace the teamspace name for the group
	 * @param model the model id for the group
	 * @param groupId the id of the group to update
	 * @param group the group object
	 */
	public updateGroup(teamspace: string, model: string, groupId: string, group: any) {

		group.new = false;
		group.updatedAt = Date.now();
		group.updatedBy = this.AuthService.getUsername();
		const groupUrl = `${teamspace}/${model}/groups/${groupId}`;
		return this.getSelectedObjects().then((currentHighlights) => {
			group.objects = currentHighlights;
			group.totalSavedMeshes = this.state.selectedObjectsLen;

			return this.APIService.put(groupUrl, group)
				.then((response) => {
					this.selectGroup(group);
					return group;
				});
		});
	}

	/**
	 * Create a group in the backend
	 * @param teamspace the teamspace name for the group
	 * @param model the model id for the group
	 * @param group the group object to add to the database
	 */
	public createGroup(teamspace: string, model: string, group: any) {

		group.new = false;
		const groupUrl = `${teamspace}/${model}/groups/`;

		return this.getSelectedObjects().then((currentHighlights) => {

			group.objects = currentHighlights;

			return this.APIService.post(groupUrl, group)
				.then((response) => {
					group._id = response.data._id;
					this.state.groups.push(group);
					group.totalSavedMeshes = this.state.selectedObjectsLen;
					this.selectGroup(group);
					if (this.state.overrideAll) {
						this.colorOverride(group);
					}
					return group;
				});
		});

	}

	/**
	 * Remove a group from the data model
	 * @param group the group to delete
	 */
	public deleteStateGroup(group: any) {
		this.deselectObjectsFromGroup(group);
		this.removeColorOverride(group._id);
		const groupIndex = this.state.groups.indexOf(group);
		const groupsCount = this.state.groups.length;

		if (this.state.selectedGroup && group._id === this.state.selectedGroup._id && groupsCount > 1) {
			const nextGroup = this.state.groups[(groupIndex + 1) % groupsCount];
			this.selectGroup(nextGroup);
		}

		this.state.groups = this.state.groups.filter((g) => {
			return group._id !== g._id;
		});
	}

	/**
	 * Removes all the groups with the ids contained in the ids array from the state
	 * @param ids the ids of the groups to be deleted
	 */
	public deleteStateGroupsByIds(ids: string[]) {
		const groups = this.state.groups.filter((f) => ids.indexOf(f._id) >= 0);
		groups.forEach(this.deleteStateGroup.bind(this));
	}

	/**
	 * Removes all the groups with the ids contained in the ids array from the state after 4 seconds
	 * while showing a feedback that these groups has been deleted
	 * @param ids the ids of the groups to be deleted
	 */
	public deleteStateGroupsByIdsDeferred(ids: string[]) {
		const groups = this.state.groups.filter((f) => ids.indexOf(f._id) >= 0);
		groups.forEach((g) => g.justBeenDeleted = true);
		this.$timeout(this.deleteStateGroupsByIds.bind(this, ids), 4000);
	}

	/**
	 * Replace a group in the data model (i.e. after an update)
	 * @param newGroup the group to delete
	 */
	public replaceStateGroup(newGroup: any) {

		// We need to update the local date state
		this.state.groups.forEach((group, i) => {
			if (newGroup._id === group._id) {
				this.state.groups[i] = newGroup;
			}
		});

		// And do the same if it's the selected group
		if (newGroup._id === this.state.selectedGroup._id) {
			this.state.selectedGroup = newGroup;
		}
	}

	/**
	 * Compares groups without taking in consideration focus/selection or objects contained in the group
	 * @param groupA a group to be compared
	 * @param groupB the other group to be compared
	 */
	public areGroupsEqual(groupA: any, groupB: any): boolean {
		const fields = ['_id', '__v', 'name', 'author', 'description', 'createdAt', 'updatedBy', 'updatedAt', 'color'];
		const areEqual = fields.every((f) => angular.toJson(groupA[f]) === angular.toJson(groupB[f]));

		return areEqual;
	}

	/**
	 * Compare groups objects
	 * @param objectsA a group objects to be compared
	 * @param objectsB the other groups objects to be compared
	 */
	public areGroupObjectsEqual(objectsA: any[], objectsB: any[]): boolean {
		const objAIds = this.getFullIdsForNodes(objectsA);
		const objBIds = this.getFullIdsForNodes(objectsB);
		let areEqual = objAIds.length === objBIds.length;
		areEqual = areEqual && objAIds.every((i) => objBIds.indexOf(i) >= 0);
		return areEqual;
	}

	private getFullIdsForNodes(nodes: any[]) {
		return nodes.reduce((obj, currentVal) => {
			const nsp = currentVal.account + '.' + currentVal.model;
			let ids = obj.concat(currentVal.shared_ids.map((id) => nsp + '.' + id));
			if (Array.isArray(currentVal.ifc_guids)) {
				ids = ids.concat(currentVal.ifc_guids.map((id) => nsp + '.' + id));
			}

			return ids;
		}, []);
	}

	/**
	 * Focus on the group given
	 * @param group the group
	 */
	private focus(group: any) {
		// Deselect previous group (perhaps can be moved to new func?)
		if (this.state.selectedGroup) {
			this.state.selectedGroup.focus = false;
		}

		this.state.selectedGroup = group;
		this.state.selectedGroup.focus = true;
	}

	// Helper  for searching strings
	private stringSearch(superString, subString) {
		if (!superString) {
			return false;
		}

		return (superString.toLowerCase().indexOf(subString.toLowerCase()) !== -1);
	}

	/**
	 * Highlight the group. This updates the internal states and also
	 * make calls to highlight the meshes
	 * @param group the group to select
	 */
	private highlightGroup(group: any) {
		group.highlighted = true;

		const color = group.color ? group.color.map((c) => c / 255) :
			this.ViewerService.getDefaultHighlightColor();

		if (!this.state.multiSelectedGroups.includes(group)) {
			this.state.multiSelectedGroups.push(group);
		}

		if (group.objects && group.objects.length > 0) {
			return this.TreeService.showNodesBySharedIds(group.objects).then(() => {
				return this.TreeService.selectNodesBySharedIds(
					group.objects,
					color
				);
			});
		}
	}

	/**
	 * Highlight the group. This updates the internal states and also
	 * make calls to highlight the meshes
	 * @param group the group to select
	 */
	private unhighlightGroup(group: any) {
		const index = this.state.multiSelectedGroups.indexOf(group);
		this.state.multiSelectedGroups.splice(index, 1);
		group.highlighted = false;
		group.focus = false;

		return this.TreeService.getNodesFromSharedIds(group.objects)
			.then((nodes) => {
				this.TreeService.deselectNodes(nodes).then((meshes) => {
					this.setTotalSavedMeshes(group);
				});
			});
	}

}

export const GroupsServiceModule = angular
	.module('3drepo')
	.service('GroupsService', GroupsService);

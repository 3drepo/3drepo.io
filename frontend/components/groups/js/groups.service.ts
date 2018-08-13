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
		"$q",
		"APIService",
		"TreeService",
		"MultiSelectService",
		"AuthService",
		"ViewerService"
	];

	private state;

	constructor(
		private $q: ng.IQService,
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
			totalSelectedMeshes : 0,
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
						const pair = key.split("@");
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
	public removeColorOverride(groupId: string) {

		const group = this.state.colorOverride[groupId];

		if (group) {
			for (const key in group.models) {

				if (group.models.hasOwnProperty(key)) {
					const meshIds = group.models[key].meshes;
					const pair = key.split("@");
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

			if (this.state.overrideAll &&
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

		const prefix = "Group ";
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

		return "rgba(255, 255, 255, 1)";
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
	public hexToRGBA(hex: string, alpha: number) {

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
				group.name = "(No assigned name)";
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
	 * Delete selected groups
	 */
	public deleteGroups(teamspace: string, model: string, all?: boolean) {
		const groupsToDelete = [];
		let nextGroup;
		for (let i = 0; i < this.state.groups.length; ++i) {
			const group = this.state.groups[i];
			if (all || group.highlighted) {
				groupsToDelete.push(group);
				const nextGroupIdx = i + 1 === this.state.groups.length ? 0 : i + 1;
				nextGroup = this.state.groups[nextGroupIdx];
			}
		}

		if (groupsToDelete.length > 0) {
			const groupsUrl = `${teamspace}/${model}/groups/?ids=${groupsToDelete.map((group) => group._id).join(",")}`;
			return this.APIService.delete(groupsUrl)
				.then((response) => {
					groupsToDelete.forEach((group) => {
						this.TreeService.getNodesFromSharedIds(group.objects).then((nodes) => {
							this.TreeService.deselectNodes(nodes);
						});
						this.removeColorOverride(group._id);
						this.deleteStateGroup(group);
						if (this.state.groups.length) {
							this.selectGroup(nextGroup);
						}
					});
					return response;
				});
		} else {
			return Promise.resolve();
		}
	}

	/**
	 * Delete all groups
	 */
	public deleteAllGroups(teamspace: string, model: string) {
		return this.deleteGroups(teamspace, model, true);
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
			// If we haven't saved don't update saved meshes
			if (!group.new) {
				group.totalSavedMeshes = totalMeshes;
			}
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
				description: "",
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
			groupUrl = `${teamspace}/${model}/groups/revision/${revision}/?noIssues=true`;
		} else {
			groupUrl = `${teamspace}/${model}/groups/revision/master/head/?noIssues=true`;
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

			return this.APIService.put(groupUrl, group)
				.then((response) => {
					group.totalSavedMeshes = this.state.selectedObjectsLen;
					this.replaceStateGroup(group);
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
	 * @param deleteGroup the group to delete
	 */
	public deleteStateGroup(deleteGroup: any) {

		this.state.groups = this.state.groups.filter((g) => {
			return deleteGroup._id !== g._id;
		});

		if (this.state.selectedGroup && deleteGroup._id === this.state.selectedGroup._id) {
			this.state.selectedGroup = null;
		}

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
				).then((meshes) => {
					this.setTotalSavedMeshes(group);
				});
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
	.module("3drepo")
	.service("GroupsService", GroupsService);

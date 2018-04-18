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
		"APIService",
		"TreeService",
		"MultiSelectService",
		"AuthService",
		"ViewerService",
	];

	private state;

	constructor(
		private APIService: any,
		private TreeService: any,
		private MultiSelectService: any,
		private AuthService: any,
		private ViewerService: any,
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
		};
	}

	/**
	 * Initialise the groups state from the backend
	 */
	public initGroups(teamspace, model) {
		return this.getGroups(teamspace, model)
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
		if (this.state.colorOverride[group._id]) {
			this.removeColorOverride(group._id);
		} else {
			this.colorOverride(group);
		}
	}

	/**
	 * Color override the meshes of a given group
	 * @param group the group to color override
	 */
	public colorOverride(group: any) {

		const color = group.color.map((c) => c / 255);

		this.TreeService.getMap()
			.then((treeMap) => {

				// Convert shared IDs to unique IDs
				let nodes = group.objects.map((object) => {
					const uid = treeMap.sharedIdToUid[object.shared_id];
					const node = this.TreeService.getNodeById(uid);
					return node;
				});

				// Remove any undefined nodes
				nodes = nodes.filter((n) => n !== undefined);

				// Create a map of meshes
				// for the colour overiding
				const meshes = this.TreeService.getMeshMapFromNodes(nodes,  treeMap.idToMeshes);

				for (const key in meshes) {

					if (key === undefined) {
						continue;
					}

					const meshIds = meshes[key].meshes;
					const pair = key.split("@");
					const modelAccount = pair[0];
					const modelId = pair[1];

					this.ViewerService.overrideMeshColor(modelAccount, modelId, meshIds, color);
				}

				this.state.colorOverride[group._id] = {
					models: meshes, color,
				};

			});
	}

	/**
	 * Remove all color overrides from all groups
	 */
	public removeAllColorOverride() {
		for (const groupId in this.state.colorOverride) {
			if (!this.state.colorOverride.hasOwnProperty(groupId)) {
				continue;
			}
			this.removeColorOverride(groupId);
		}
	}

	/**
	 * Remove all color overrides from a given group based on it's ID
	 */
	public removeColorOverride(groupId: string) {

		const group = this.state.colorOverride[groupId];
		if (!group) {
			return;
		}

		for (const key in group.models) {

			if (!group.models.hasOwnProperty(key)) {
				continue;
			}

			const meshIds = group.models[key].meshes;
			const pair = key.split("@");
			const account = pair[0];
			const model = pair[1];

			this.ViewerService.resetMeshColor(
				account,
				model,
				meshIds,
				group.color,
			);
		}

		delete this.state.colorOverride[groupId];

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
		this.updateSelectedGroupColor();
	}

	/**
	 * Return an CSS friendly RGBA color from an array
	 */
	public getRGBA(color) {
		const red = color[0];
		const blue = color[1];
		const green = color[2];
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
			parseInt((Math.random() * 255).toFixed(0), 10),
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
			parseInt(result[3], 16),
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
		this.selectGroup(group).then(() => {
			this.TreeService.isolateNodesBySharedId(this.state.selectedGroup.objects);
		});
	}

	public clearSelectionHighlights() {
		this.state.groups.forEach((group) => {
			group.highlighted = false;
		});
	}

	public deleteGroups(teamspace, model) {
		const deleteGroupPromises = [];
		this.state.groups.forEach((group) => {
			if (group.highlighted) {
				deleteGroupPromises.push(this.deleteGroup(teamspace, model, group));
			}
		});
		return Promise.all(deleteGroupPromises);
	}

	/**
	 * Select a group
	 * @param group the group to select
	 */
	public selectGroup(group: any) {

		const sameGroup = this.state.selectedGroup === group;
		const multi = this.MultiSelectService.isMultiMode();

		if (this.state.selectedGroup) {
			this.state.selectedGroup.selected = false;
		}
		this.state.selectedGroup = group;
		this.state.selectedGroup.selected = true;
		this.state.selectedGroup.highlighted = !this.state.selectedGroup.highlighted; // Toggle

		// If it has no set totalSavedMeshes
		if (this.state.selectedGroup.totalSavedMeshes === undefined) {
			this.state.selectedGroup.totalSavedMeshes = 0;
		}

		let color = this.ViewerService.getDefaultHighlightColor();
		if (!this.state.selectedGroup.new) {
			color = this.state.selectedGroup.color.map((c) => c / 255);
		}

		let selectNodes = true;

		if (!multi) {
			this.state.multiSelectedGroups = [group];
			this.clearSelectionHighlights();
			this.state.selectedGroup.highlighted = true;
		} else if (!this.state.multiSelectedGroups.includes(group)) {

			// selecting group that's not selected
			this.state.multiSelectedGroups.push(group);

		} else {
			selectNodes = false;
		}

		if (selectNodes) {

			return this.TreeService.showTreeNodesBySharedIds(this.state.selectedGroup.objects).then(() => {
				return this.TreeService.selectNodesBySharedIds(
					this.state.selectedGroup.objects,
					multi, // multi
					color,
					true,
				).then((meshes) => {
					this.setTotalSavedMeshes();

				});
			});

		} else {

			// Remove the group from selected groups
			const index = this.state.multiSelectedGroups.indexOf(group);
			this.state.multiSelectedGroups.splice(index, 1);

			// selecting a group that's already selected
			return this.TreeService.getNodesFromSharedIds(this.state.selectedGroup.objects)
				.then((nodes) => {

					this.TreeService.deselectNodes(nodes).then((meshes) => {
						this.setTotalSavedMeshes();
					});

				});
		}

	}

	public setTotalSavedMeshes() {
		this.TreeService.getCurrentMeshHighlightsFromViewer().then((viewerState) => {
			// If we haven't saved don't update saved meshes
			if (!this.state.selectedGroup.new) {
				const total = viewerState.highlightedNodes.length;
				this.state.selectedGroup.totalSavedMeshes = total;
			}
		});
	}

	// This is how we would calculate total meshes if we didn't use the viewer:
	// public getTotalMeshes(meshes) {
	// 	let total = 0;
	// 	for (const key in meshes) {
	// 		if (key && meshes[key] && meshes[key].meshes) {
	// 			total += meshes[key].meshes.length;
	// 		}
	// 	}
	// 	return total;
	// }

	/**
	 * Generate a placeholder object for a new group
	 */
	public generateNewGroup(): any {
		return this.getSelectedObjects().then((objects) => {
			return {
				new: true,
				createdAt: Date.now(),
				updatedAt: Date.now(),
				updatedBy: this.AuthService.getUsername(),
				author: this.AuthService.getUsername(),
				description: "",
				name: this.getDefaultGroupName(this.state.groups),
				color: this.getRandomColor(),
				objects,
			};
		});
	}

	/**
	 * Update the selected group color in the viewer
	 */
	public updateSelectedGroupColor() {

		if (!this.state.selectedGroup.color) {
			return;
		}

		const color = this.state.selectedGroup.color.map((c) => c / 255);

		if (this.state.selectedGroup.objects && !this.state.selectedGroup.new) {

			const currentSelected = this.TreeService.getCurrentSelectedNodes().concat();
			const groupObjects = this.state.selectedGroup.objects.concat();

			// Find the nodes from the group that are currently selected
			const intersection = groupObjects.filter((o) => {
				return currentSelected.find((n) => n.shared_id === o.shared_id );
			});

			this.TreeService.highlightNodesBySharedId(
				intersection,
				true, // multi
				color,
				true,
			);
		}

	}

	/**
	 * Get the selected objects fit for sending to the backend
	 */
	public getSelectedObjects() {
		return this.TreeService.getCurrentMeshHighlightsFromViewer().then((objects) => {
			objects = objects.highlightedNodes;
			const cleanedObjects = [];
			for (let i = 0; i < objects.length; i++) {
				cleanedObjects[i] = {
					shared_id:  objects[i].shared_id,
					account:  objects[i].account,
					model: objects[i].project || objects[i].model,
				};
			}

			return cleanedObjects;
		});
	}

	/**
	 * Get the groups from the backend
	 */
	public getGroups(teamspace: string, model: string) {
		const groupUrl = `${teamspace}/${model}/groups?noIssues=true`;

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
			const savedMeshesLength = currentHighlights.length;

			return this.APIService.put(groupUrl, group)
				.then((response) => {
					group.totalSavedMeshes = savedMeshesLength;
					this.replaceStateGroup(group);
					this.updateSelectedGroupColor();
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
			const savedMeshesLength = currentHighlights.length;

			return this.APIService.post(groupUrl, group)
				.then((response) => {
					group._id = response.data._id;
					this.state.groups.push(group);
					this.state.selectedGroup = group;
					this.state.selectedGroup.totalSavedMeshes = savedMeshesLength;
					this.updateSelectedGroupColor();
					return group;
				});
		});

	}

	public selectNextGroup() {
		this.selectGroup(this.state.groups[0]);
	}

	/**
	 * Delete a group in the backend
	 * @param teamspace the teamspace name for the group
	 * @param model the model id for the group
	 * @param group the group object to delete
	 */
	public deleteGroup(teamspace: string, model: string, deleteGroup: any) {
		const groupUrl = `${teamspace}/${model}/groups/${deleteGroup._id}`;
		return this.APIService.delete(groupUrl)
			.then((response) => {
				this.TreeService.deselectNodes(deleteGroup.objects);
				this.removeColorOverride(deleteGroup._id);
				this.deleteStateGroup(deleteGroup);
				return response;
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

}

export const GroupsServiceModule = angular
	.module("3drepo")
	.service("GroupsService", GroupsService);

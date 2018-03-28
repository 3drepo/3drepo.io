/**
 *	Copyright (C) 2017 3D Repo Ltd
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

	public reset() {
		this.state = {
			groups: [],
			selectedGroup: {},
			colorOveride: {},
			totalSelectedMeshes : 0,
		};
	}

	public hasColorOveride(group) {
		return this.state.colorOveride[group._id] !== undefined;
	}

	public toggleColorOveride(account, model, group) {
		if (this.state.colorOveride[group._id]) {
			this.removeColorOveride(group._id);
		} else {
			this.colorOveride(account, model, group);
		}
	}

	public colorOveride(account, model, group) {

		const color = group.color.map((c) => c / 255);

		this.TreeService.getMap()
			.then((treeMap) => {

				// Create a map of meshes
				// for the colour overiding
				const meshes = {};

				group.objects.forEach((object) => {
					const uid = treeMap.sharedIdToUid[object.shared_id];
					const node = this.TreeService.getNodeById(uid);
					this.TreeService.traverseNodesAndPushId(node, meshes, treeMap.idToMeshes);
				});

				for (const key in meshes) {

					if (key === undefined) {
						continue;
					}

					const meshIds = meshes[key].meshes;
					const pair = key.split("@");
					const account = pair[0];
					const model = pair[1];

					this.ViewerService.overrideMeshColor(account, model, meshIds, color);
				}

				this.state.colorOveride[group._id] = {
					models: meshes, color,
				};

			});
	}

	public removeAllColorOveride() {
		for (const groupId in this.state.colorOveride) {
			if (!this.state.colorOveride.hasOwnProperty(groupId)) {
				continue;
			}
			this.removeColorOveride(groupId);
		}
	}

	public removeColorOveride(groupId) {

		const group = this.state.colorOveride[groupId];

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

		delete this.state.colorOveride[groupId];
	}

	public reselectGroup(group) {
		// this.TreeService.showAllTreeNodes(true);
		this.selectGroup(group);
	}

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

	public initGroups(teamspace, model) {
		return this.getGroups(teamspace, model)
			.then((groups) => {
				this.state.groups = groups;
				this.cleanGroups(this.state.groups);
			});
	}

	public getDefaultGroupName(groups) {
		const groupNames = [];
		groups.forEach((group) => {
			groupNames.push(group.name);
		});

		const prefix = "Group ";
		let num = 1;
		let groupName = prefix + num;
		while (groupNames.indexOf(groupName) !== -1) {
			groupName = prefix + num++;
		}
		return groupName;
	}

	public setSelectedGroupColor(color) {
		this.state.selectedGroup.color = color;
		this.updateSelectedGroupColor();
	}

	public getRGBA(color) {
		const red = color[0];
		const blue = color[1];
		const green = color[2];
		return `rgba(${red}, ${blue}, ${green}, 1)`;
	}

	public getGroupRGBAColor(group) {
		if (group && group.color) {
			return this.getRGBA(group.color);
		}

		return "rgba(255, 255, 255, 1)";
	}

	public getRandomColor() {
		return [
			(Math.random() * 255).toFixed(0),
			(Math.random() * 255).toFixed(0),
			(Math.random() * 255).toFixed(0),
		];
	}

	public hexToRGBA(hex, alpha) {

		alpha = (alpha !== undefined) ? alpha : 1;

		// Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
		const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
		hex = hex.replace(shorthandRegex, function(m, r, g, b) {
			return r + r + g + g + b + b;
		});

		const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		return result ? [
			parseInt(result[1], 16),
			parseInt(result[2], 16),
			parseInt(result[3], 16),
		] : [];

	}

	public cleanGroups(groups) {
		groups.forEach((group) => {
			if (!group.name) {
				group.name = "No assigned name";
			}
		});
	}

	public isolateGroup(group: any) {
		this.selectGroup(group).then(() => {
			this.TreeService.isolateNodesBySharedId(this.state.selectedGroup.objects);
		});
	}

	public selectGroup(group: any) {
		if (this.state.selectedGroup) {
			this.state.selectedGroup.selected = false;
		}
		this.state.selectedGroup = group;
		this.state.selectedGroup.selected = true;
		this.state.selectedGroup.totalSavedMeshes = 0;

		if (this.state.selectedGroup.objects) {

			const multi = this.MultiSelectService.isMultiMode();
			const color = this.state.selectedGroup.color.map((c) => c / 255);

			return this.TreeService.selectNodesBySharedIds(
				this.state.selectedGroup.objects,
				multi, // multi
				true,
				color,
			).then(() => {
				this.updateTotalSavedMeshes();
			});
		}

		return Promise.resolve();

	}

	public updateTotalSavedMeshes() {
		this.getCurrentMeshHighlights().then((meshTotal) => {
			this.state.selectedGroup.totalSavedMeshes = meshTotal;
		});
	}

	public generateNewGroup() {
		return {
			new: true,
			createdAt: Date.now(),
			updatedAt: Date.now(),
			updatedBy: this.AuthService.getUsername(),
			author: this.AuthService.getUsername(),
			description: "",
			name: this.getDefaultGroupName(this.state.groups),
			color: this.getRandomColor(),
			objects: this.getSelectedObjects(),
		};
	}

	public updateSelectedGroupColor() {
		const color = this.state.selectedGroup.color.map((c) => c / 255);

		if (this.state.selectedGroup.objects) {
			this.TreeService.selectNodesBySharedIds(
				this.state.selectedGroup.objects,
				false, // multi
				true,
				color,
			);
		}

	}

	public getSelectedObjects() {
		const objects = this.TreeService.getCurrentSelectedNodes();
		const cleanedObjects = [];
		for (let i = 0; i < objects.length; i++) {
			cleanedObjects[i] = {
				shared_id:  objects[i].shared_id,
				account:  objects[i].account,
				model: objects[i].project,
			};
		}

		return cleanedObjects;
	}

	public getGroups(teamspace: string, model: string) {
		const groupUrl = `${teamspace}/${model}/groups?noIssues=true`;

		return this.APIService.get(groupUrl)
			.then((response) => {
				this.state.groups = response.data;
			});
	}

	public updateGroup(teamspace: string, model: string, groupId: string, group: any) {

		group.new = false;
		group.updatedAt = Date.now();
		group.updatedBy = this.AuthService.getUsername();
		const groupUrl = `${teamspace}/${model}/groups/${groupId}`;
		group.objects = this.getSelectedObjects();

		return this.APIService.put(groupUrl, group)
			.then((response) => {
				const newGroup = response.data;
				newGroup.new = false;
				this.replaceStateGroup(newGroup);
				this.updateSelectedGroupColor();
				this.updateTotalSavedMeshes();
				return newGroup;
			});
	}

	public createGroup(teamspace: string, model: string, group: any) {

		group.new = false;
		const groupUrl = `${teamspace}/${model}/groups/`;
		group.objects = this.getSelectedObjects();

		return this.APIService.post(groupUrl, group)
			.then((response) => {
				const newGroup = response.data;
				newGroup.new = false;
				this.state.groups.push(newGroup);
				this.state.selectedGroup = newGroup;
				this.updateSelectedGroupColor();
				return newGroup;
			});
	}

	public deleteGroup(teamspace: string, model: string, deleteGroup: any) {
		const groupUrl = `${teamspace}/${model}/groups/${deleteGroup._id}`;
		return this.APIService.delete(groupUrl)
			.then((response) => {
				this.deleteStateGroup(deleteGroup);
				return response;
			});
	}

	public deleteStateGroup(deleteGroup: any) {
		this.state.groups = this.state.groups.filter((g) => {
			return deleteGroup._id !== g._id;
		});
		if (deleteGroup._id === this.state.selectedGroup._id) {
			this.state.selectedGroup = null;
		}
	}

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

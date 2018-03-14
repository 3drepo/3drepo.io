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
	];

	constructor(
	) {
	}

	getGroups(teamspace, model) {

		// const group = this.APIService.get(hiddenGroupUrl)
		// 		.then((response) => {

		// 		});
		
		return Promise.resolve([
			{
				name: "Group 1",
				author: "James",
				date: "24/08/2018",
				description: "A new group hahahahahha",
				color: "green"
			},
			{
				name: "Group 2",
				author: "James",
				date: "24/08/2018",
				description: "A group numbered 2",
				color: "red"
			},		{
				name: "Group 3",
				author: "James",
				date: "24/08/2018",
				description: "A new group hahahahahha",
				color: "orange"
			},
			{
				name: "Group 4",
				author: "James",
				date: "24/08/2018",
				description: "A group numbered 2",
				color: "yellow"
			},
			{
				name: "Group 5",
				author: "James",
				date: "24/08/2018",
				description: "A new group hahahahahha",
				color: "blue"
			},
		]);
	}
	
}

export const GroupsServiceModule = angular
	.module("3drepo")
	.service("GroupsService", GroupsService);

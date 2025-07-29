/**
 *  Copyright (C) 2022 3D Repo Ltd
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

import { sortByName } from '@/v5/store/store.helpers';

const splitPattern = /::+/g;
const trimPattern = /(?=^)::+|::+(?=$)/g;

export const getGroupNamePath = (str:string) => {
	const trimmedStr = str.trim().replace(trimPattern, '');
	return trimmedStr.split(splitPattern);
};

const getGroupNameParent = (group):string => {
	const path = getGroupNamePath(group.name);
	path.pop();
	return path.join('::');
};

export const getSortedGroups = (groups = []) => {
	 
	const clonedGroups = sortByName(groups);

	clonedGroups.sort((groupA, groupB) => {
		const parentA = getGroupNameParent(groupA);
		const parentB = getGroupNameParent(groupB);
		const isAncestorA = groupB.name.startsWith(parentA);
		const isAncestorB = groupA.name.startsWith(parentB);

		if (isAncestorA === isAncestorB) {
			return 0;
		}

		return isAncestorA ? -1 : 1;
	});
	return clonedGroups;
};

export const groupsToTree = (groups) => {
	const treeDict = {};

	const tree = [];

	// Adds to dictionary all the intermediates folders with the folders added to its
	// children and returns its root node if its the first time it was created
	// eg:
	// const dict = {
	// }
	// createFullPath(['dad', 'child0','grandchild'], dict);
	// will change the dictionary to
	// {
	// 'dad::child0:grandchild': { name: 'grandchild', children: [] },
	// 'dad::child0': { name: 'child0', children: [{ name: 'grandchild', children: [] }] },
	// 'dad': { name: 'dad', children: [{ name: 'child0', children: [{ name: 'grandchild' }] }] },
	// };
	//
	// And returns the 'dad' entry
	//
	// If if there was some ancestors created, then returns null
	const createFullPath = (path, dict) => {
		let previous = null;

		while (path.length) {
			const pathName = path.join('::');
			const name = path.pop();

			if (dict[pathName]) {
				previous = null;
				break;
			}

			const groupsContainer = {
				name,
				pathName,
				children: [],
			};

			if (previous) {
				groupsContainer.children.push(previous);
			}

			const parentPathName = path.join('::');

			if (dict[parentPathName]) {
				dict[parentPathName].children.push(groupsContainer);
			}

			 
			dict[pathName] = groupsContainer;
			previous = groupsContainer;
		}

		return previous;
	};

	groups.forEach((group) => {
		// The group path is given by the name like 'dad::child:grandchild'
		const path = getGroupNamePath(group.name);
		path.pop();
		const parentNamed = path.join('::');

		if (path.length) {
			const rootElement = createFullPath(path, treeDict);

			if (rootElement) {
				tree.push(rootElement);
			}
		}

		if (treeDict[parentNamed]) {
			treeDict[parentNamed].children.push(group);
		} else {
			tree.push(group);
		}
	});

	return tree;
};

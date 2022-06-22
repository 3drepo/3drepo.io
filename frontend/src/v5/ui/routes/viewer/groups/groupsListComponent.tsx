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

/* eslint-disable @typescript-eslint/no-use-before-define */
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

import _ from 'lodash';

interface Props {
	groups: any [];
}

const groupsToTree = (groups) => {
	const sortedGroups = _.sortBy(groups, 'name');

	const treeDict = {
	};

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
		let lastAncestor = null;

		while (path.length) {
			const ancestorName = path.join('::');
			const name = path.pop();
			if (dict[ancestorName]) {
				lastAncestor = null;
				break;
			}
			const groupsContainer = {
				name,
				children: [],
			};

			if (lastAncestor) {
				groupsContainer.children.push(groupsContainer);
			}

			// eslint-disable-next-line no-param-reassign
			dict[ancestorName] = groupsContainer;
			lastAncestor = groupsContainer;
		}

		return lastAncestor;
	};

	sortedGroups.forEach((group) => {
		// The group path is given by the name like 'dad::child:grandchild'
		const path = group.name.split('::');
		path.pop();
		const parentName = path.join('::');

		if (path.length) {
			const rootElement = createFullPath(path, treeDict);

			if (rootElement && !rootElement?.children.length) {
				tree.push(rootElement);
			}
		}

		if (treeDict[parentName]) {
			treeDict[parentName].children.push(group);
		} else {
			tree.unshift(group);
		}
	});

	return tree;
};

const TreeItem = ({ item }) => {
	if (item.children) {
		return (
			<li>
				{item.name} ({item.children.length})v
				<Tree tree={item.children} />
			</li>
		);
	}

	return (<li> {item.name} objects: {item.objects.length}</li>);
};

const Tree = ({ tree }) => (
	<ul>
		{tree.map((item) => (<TreeItem item={item} />))}
	</ul>
);

export const GroupsListComponent = ({ groups }:Props) => {
	const tree = groupsToTree(groups);
	return (<Tree tree={tree} />);
};

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
import _ from 'lodash';
import { SyntheticEvent, useEffect, useState } from 'react';
import { Checkbox } from '@mui/material';
import { GroupsActionsDispatchers } from '@/v5/services/actionsDispatchers/groupsActions.dispatchers';
import { GroupsHooksSelectors } from '@/v5/services/selectorsHooks/groupsSelectors.hooks';

interface Props {
	groups: any [];
}

interface Group {
	name: string;
	_id: string;
}

interface GroupSet {
	name: string;
	pathName: string;
	children: (GroupSet | Group)[],
	override?: Boolean;
	count?: number;
}

const groupsToTree = (groups) => {
	// eslint-disable-next-line no-param-reassign
	groups = _.sortBy(groups, ({ name }) => name.toLowerCase());

	const parentName = (group):string => {
		const path = group.name.split('::');
		path.pop();
		return path.join('::');
	};

	groups.sort((groupA, groupB) => {
		const parentA = parentName(groupA);
		const parentB = parentName(groupB);
		const isAncestorA = groupB.name.startsWith(parentA);
		const isAncestorB = groupA.name.startsWith(parentB);

		if (isAncestorA === isAncestorB) {
			return 0;
		}

		return isAncestorA ? -1 : 1;
	});

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

			// eslint-disable-next-line no-param-reassign
			dict[pathName] = groupsContainer;
			previous = groupsContainer;
		}

		return previous;
	};

	groups.forEach((group) => {
		// The group path is given by the name like 'dad::child:grandchild'
		const path = group.name.split('::');
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

const getGroupSetData = (groupSet: GroupSet) => {
	// eslint-disable-next-line no-param-reassign

	const overrides = GroupsHooksSelectors.selectGroupsColourOverridesSet();
	const highlights = GroupsHooksSelectors.selectHighlightedGroups();

	const data = groupSet.children.reduce((partialData, groupOrGroupSet:any) => {
		// eslint-disable-next-line prefer-const
		let { override, descendants, highlight } = partialData;
		let childGroupSetData = null;
		let childHighlight = null;

		if (groupOrGroupSet.children) {
			childGroupSetData = getGroupSetData(groupOrGroupSet as GroupSet);
			childHighlight = childGroupSetData.highlight;
			Array.prototype.push.apply(descendants, childGroupSetData.descendants);
		} else {
			descendants.push(groupOrGroupSet._id);
			childHighlight = highlights.has(groupOrGroupSet._id);
		}

		if (highlight === null) {
			highlight = childHighlight;
		}

		highlight = highlight && childHighlight;

		if (override !== undefined) {
			let childOverride = null;

			if (!(groupOrGroupSet as GroupSet).children) {
				const groupId = (groupOrGroupSet as Group)._id;
				childOverride = overrides.has(groupId);
			} else {
				childOverride = childGroupSetData.override;
			}

			override = override === null || override === childOverride ? childOverride : undefined;
		}

		return { override, descendants, highlight };
	}, { override: null, descendants: [], highlight: null });

	return data;
};

const GroupItem = ({ item }) => {
	const isOverriden = GroupsHooksSelectors.selectGroupsColourOverridesSet().has(item._id);
	const isHighlighted = GroupsHooksSelectors.selectHighlightedGroups().has(item._id);
	const backgroundColor = isHighlighted ? 'cyan' : 'white';

	const onClickOverride = (event) => {
		event.stopPropagation();
		GroupsActionsDispatchers.setColorOverrides([item._id], !isOverriden);
	};

	const onClickIsolate = (event) => {
		event.stopPropagation();
		GroupsActionsDispatchers.isolateGroups([item._id]);
	};

	const onClickHighlight = (event) => {
		event.stopPropagation();
		GroupsActionsDispatchers.setActiveGroup(item);
	};

	return (
		<li
			role="treeitem"
			style={{ backgroundColor }}
			onClick={onClickHighlight}
			onKeyDown={onClickHighlight}
		>
			{item.name} objects: {item.objects.length}
			<Checkbox checked={isOverriden} onClick={onClickOverride} />
			<button onClick={onClickIsolate} type="button">
				<span role="img" aria-label="isolate">👁️</span>
			</button>
		</li>
	);
};

const GroupSetItem = ({ item, collapse }: {item: GroupSet, collapse}) => {
	const [collapseDict, setCollapse] = collapse;
	const hidden = collapseDict[item.pathName] ?? true;
	const hiddenIcon = hidden ? '^' : 'v';
	const { override, descendants, highlight } = getGroupSetData(item);

	const backgroundColor = highlight ? 'cyan' : 'white';

	const onClickItem = (event: SyntheticEvent) => {
		event.stopPropagation();
		setCollapse({ ...collapseDict, [item.pathName]: !hidden });
	};

	const onClickOverride = (event: SyntheticEvent) => {
		event.stopPropagation();
		GroupsActionsDispatchers.setColorOverrides(descendants, (override === false));
	};

	const onClickIsolate = (event) => {
		event.stopPropagation();
		GroupsActionsDispatchers.isolateGroups(descendants);
	};

	const indeterminate = override === undefined;
	const checked = !!override;

	return (
		<li
			onClick={onClickItem}
			onKeyDown={onClickItem}
			role="treeitem"
			style={{ cursor: 'default', backgroundColor }}
		>
			<b>{item.name} ({descendants.length})
				<Checkbox checked={checked} indeterminate={indeterminate} onClick={onClickOverride} />
				<button onClick={onClickIsolate} type="button">
					<span role="img" aria-label="isolate">👁️</span>
				</button>
				&nbsp; {hiddenIcon}
			</b>
			{!hidden && <Tree tree={item.children} collapse={collapse} />}
		</li>
	);
};

const TreeItem = ({ item, collapse }) => {
	if (item.children) {
		return (<GroupSetItem item={item} collapse={collapse} />);
	}

	return (<GroupItem item={item} />);
};

const Tree = ({ tree, collapse }) => (
	<ul>
		{tree.map((item) => (<TreeItem item={item} collapse={collapse} />))}
	</ul>
);

export const GroupsListComponent = ({ groups }:Props) => {
	const [tree, setTree] = useState([]);
	const collapse = useState({});

	useEffect(() => {
		setTree(groupsToTree(groups));
	}, [groups]);

	return (<Tree tree={tree} collapse={collapse} />);
};

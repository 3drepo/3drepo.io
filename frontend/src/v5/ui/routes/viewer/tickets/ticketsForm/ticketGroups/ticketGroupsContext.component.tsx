/**
 *  Copyright (C) 2023 3D Repo Ltd
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

import { GroupOverride } from '@/v5/store/tickets/tickets.types';
import _, { isEqual } from 'lodash';
import { useEffect, useState } from 'react';
import { TicketGroupsContext } from './ticketGroupsContext';
import { GroupNode, GroupState, addIndex, createTreeNode, groupOverridesToTree } from './ticketGroupsContext.helper';

const OPPOSITE_GROUP_STATE = {
	[GroupState.CHECKED]: GroupState.UNCHECKED,
	[GroupState.UNCHECKED]: GroupState.CHECKED,
	[GroupState.INDETERMINATE]: GroupState.CHECKED,
} as const;

/* eslint-disable no-param-reassign */
type TicketGroupsContextComponentProps = {
	overrides: GroupOverride[],
	groupType: 'colored' | 'hidden',
	children: any,
	onSelectedGroupsChange?: (selectedGroups: GroupOverride[]) => void,
	onDeleteGroup?: (index: number) => void,
	onEditGroup?: (index: number) => void
	highlightedIndex: number,
	setHighlightedIndex: (index: number) => void,
};
export const TicketGroupsContextComponent = ({
	children,
	overrides,
	onDeleteGroup,
	onSelectedGroupsChange,
	onEditGroup: editGroup,
	...contextValue
}: TicketGroupsContextComponentProps) => {
	const [indexedOverrides, setIndexedOverrides] = useState(addIndex(overrides));
	const [groupsTree, setGroupTree] = useState<GroupNode>(null);
	const [selectedIndexes, setSelectedIndexes] = useState<number[]>([]);

	const getGroupNode = (prefix = []): GroupNode => {
		if (!groupsTree) return null;
		let currentNode = groupsTree;
		prefix.forEach((prefixSegment) => {
			currentNode = currentNode.children.find((c) => c.prefixSegment === prefixSegment);
		});
		return currentNode;
	};

	const getNodeParent = (index) => getGroupNode(indexedOverrides.find((g) => g.index === index).prefix);

	const getGroupLeaf = (index) => getNodeParent(index).children.find((c) => c.index === index);

	const getCollectionState = (prefix?) => getGroupNode(prefix)?.state ?? null;

	const backpropagateNodeUpdate = (node: GroupNode) => {
		if (node.children.length) {
			const firstChildState = node.children[0].state;
			const allChildrenStatesAreEqual = node.children.every((c) => c.state === firstChildState);
			const newState = allChildrenStatesAreEqual ? firstChildState : GroupState.INDETERMINATE;
			if (node.state === newState) return;
			node.state = newState;
		}
		if (node.parent) {
			backpropagateNodeUpdate(node.parent);
		}
	};

	const updateTree = (currentNode) => {
		backpropagateNodeUpdate(currentNode);
		const newTree = { ...groupsTree };
		// next line is necessary because after the line above the reference
		// to the parent node in root's children does not match the root anymore
		newTree.children.forEach((c) => { c.parent = newTree; });
		setGroupTree(newTree);
	};

	const setGroupNodeState = (groupNode: GroupNode, newState: Exclude<GroupState, GroupState.INDETERMINATE>) => {
		if (groupNode.state === newState) return;
		groupNode.state = newState;
		groupNode.children.forEach((c) => setGroupNodeState(c, newState));
	};

	const toggleGroupState = (index) => {
		const groupLeaf = getGroupLeaf(index);
		setGroupNodeState(groupLeaf, OPPOSITE_GROUP_STATE[groupLeaf.state]);
		updateTree(groupLeaf);
	};

	const toggleCollectionState = (prefix = []) => {
		const groupNode: GroupNode = getGroupNode(prefix);
		const newState = OPPOSITE_GROUP_STATE[groupNode.state];
		groupNode.children.forEach((node) => setGroupNodeState(node, newState));
		updateTree(groupNode);
	};

	const shiftIndex = (node: GroupNode, removedIndex: number) => {
		if (node.index && node.index > removedIndex) {
			node.index--;
			return;
		}
		node.children.forEach((n) => shiftIndex(n, removedIndex));
	};

	const deleteCollectionIfEmpty = (node: GroupNode) => {
		if (node.children.length || !node.parent) return node;
		const { parent } = node;
		parent.children = parent.children.filter((c) => c !== node);
		return deleteCollectionIfEmpty(parent);
	};

	const deleteGroup = (index: number) => {
		if (onDeleteGroup) {
			const parent = getNodeParent(index);
			// update tree
			parent.children = parent.children.filter((c) => c.index !== index);
			shiftIndex(groupsTree, index);
			indexedOverrides.splice(index, 1);

			// update the overrides
			setIndexedOverrides(indexedOverrides.map((override) => {
				if (override.index < index) return override;
				return { ...override, index: override.index - 1 };
			}));

			const closestAncestorWithChildren = deleteCollectionIfEmpty(parent);
			updateTree(closestAncestorWithChildren);
			onDeleteGroup(index);
		}
	};

	const getSelectedIndexes = ({ children: nodeChildren, index, state } = groupsTree, indexes = []) => {
		if (!nodeChildren.length && state === GroupState.CHECKED) return index;
		return nodeChildren.flatMap((c) => getSelectedIndexes(c, indexes));
	};

	useEffect(() => {
		const isColored = contextValue.groupType === 'colored';
		const tree = groupOverridesToTree(indexedOverrides, isColored ? GroupState.CHECKED : GroupState.UNCHECKED);
		setGroupTree(tree);
	}, []);

	useEffect(() => {
		if (!groupsTree) return;
		const newSelectedIndexes = getSelectedIndexes();
		if (isEqual(newSelectedIndexes, selectedIndexes)) return;
		setSelectedIndexes(newSelectedIndexes);
		const selectedOverrides = _.orderBy([...indexedOverrides], 'prefix', 'desc')
			.filter(({ index }) => newSelectedIndexes.includes(index))
			.map(({ index, ...override }) => override);
		onSelectedGroupsChange?.(selectedOverrides);
	}, [groupsTree]);

	useEffect(() => {
		// overrides length increased as a new override was added
		if (overrides.length > indexedOverrides.length) {
			const index = overrides.length - 1;
			const newOverride = overrides[index];
			const firstPrefixSegments = newOverride.prefix.slice(0, -1);
			// @ts-ignore
			const lastPrefixSegment = newOverride.prefix.at(-1);

			let parent = getGroupNode(firstPrefixSegments);
			if (lastPrefixSegment) {
				const child = parent.children.find(({ prefixSegment }) => prefixSegment === lastPrefixSegment);
				if (!child) {
					const newColletionNode = createTreeNode(null, lastPrefixSegment, parent, GroupState.CHECKED, null);
					parent.children.push(newColletionNode);
					parent = newColletionNode;
				} else {
					parent = child;
				}
			}
			const newNode = createTreeNode(index, null, parent, GroupState.CHECKED, newOverride);
			parent.children.push(newNode);
			updateTree(parent);
		}
		setIndexedOverrides(addIndex(overrides));
	}, [overrides]);

	return (
		<TicketGroupsContext.Provider
			value={{
				...contextValue,
				toggleGroupState,
				toggleCollectionState,
				getCollectionState,
				selectedIndexes,
				indexedOverrides,
				deleteGroup,
				editGroup,
			}}
		>
			{children}
		</TicketGroupsContext.Provider>
	);
};

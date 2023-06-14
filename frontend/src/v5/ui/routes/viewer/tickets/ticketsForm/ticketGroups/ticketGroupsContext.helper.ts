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

export enum GroupState {
	CHECKED = 1,
	INDETERMINATE = 0,
	UNCHECKED = -1,
}

export type IndexedOverride = GroupOverride & { index: number };

export type GroupNode = {
	// for leaves
	index: number,
	// for internal nodes
	prefixSegment: string,
	parent: GroupNode,
	state: GroupState,
	override: IndexedOverride,
	children: GroupNode[],
};

const createTreeNode = (index, prefixSegment, parent, state, override): GroupNode => ({
	index,
	prefixSegment,
	parent,
	state,
	override,
	children: [],
});

export const groupOverridesToTree = (groupOverrides: IndexedOverride[], defaultState = GroupState.UNCHECKED): GroupNode => {
	const root = createTreeNode(null, null, null, defaultState, null);

	let currentNode: GroupNode;
	groupOverrides.forEach((override) => {
		currentNode = root;
		const { prefix, index } = override;
		prefix?.forEach((prefixSegment) => {
			let child = currentNode.children.find((c) => c.prefixSegment === prefixSegment);
			if (!child) {
				child = createTreeNode(null, prefixSegment, currentNode, defaultState, override);
				currentNode.children.push(child);
			}
			currentNode = child;
		});
		currentNode.children.push(createTreeNode(index, null, currentNode, defaultState, override));
	});

	return root;
};

export const addIndex = ((overrides: GroupOverride[]) => overrides.map((h, index) => ({ index, ...h })));

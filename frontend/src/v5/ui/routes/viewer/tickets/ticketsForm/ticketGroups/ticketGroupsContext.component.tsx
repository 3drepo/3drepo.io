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

import { Group, GroupOverride } from '@/v5/store/tickets/tickets.types';
import _, { sortBy } from 'lodash';
import { useEffect, useState } from 'react';
import { TicketGroupsContext } from './ticketGroupsContext';
import { GroupState, IndexedOverride, addIndex } from './ticketGroupsContext.helper';

 
type TicketGroupsContextComponentProps = {
	overrides: GroupOverride[],
	groupType: 'colored' | 'hidden',
	children: any,
	onSelectedGroupsChange?: (indexes: number[]) => void,
	onDeleteGroups?: (indexes: number[]) => void,
	onEditGroup?: (index: number) => void,
	highlightedIndex: number,
	setHighlightedIndex: (index: number) => void,
	clearHighlightedIndex: () => void,
};
export const TicketGroupsContextComponent = ({
	children,
	overrides,
	onDeleteGroups,
	onSelectedGroupsChange,
	onEditGroup,
	highlightedIndex,
	clearHighlightedIndex,
	...contextValue
}: TicketGroupsContextComponentProps) => {
	// overrides should arrive already indexed
	const [indexedOverrides, setIndexedOverrides] = useState<IndexedOverride[]>(_.sortBy(addIndex(overrides), 'prefix'));
	const [checkedIndexes, setCheckedIndexes] = useState<number[]>(overrides.map((o, i) => i));

	const getGroupIsChecked = (index) => checkedIndexes.includes(index);

	const setGroupIsChecked = (index, state) => setCheckedIndexes(
		state ? _.union(checkedIndexes, [index]) : _.without(checkedIndexes, index),
	);

	const getCollectionState = (indexes = []) => {
		if (!indexes.length) return GroupState.UNCHECKED;
		const firstDescendantState = getGroupIsChecked(indexes[0]);
		if (!indexes.every((index) => getGroupIsChecked(index) === firstDescendantState)) return GroupState.INDETERMINATE;
		return firstDescendantState ? GroupState.CHECKED : GroupState.UNCHECKED;
	};

	const setCollectionIsChecked = (indexes, state) => setCheckedIndexes(
		state ? _.union(checkedIndexes, indexes) : _.without(checkedIndexes, ...indexes),
	);

	const handleDeleteGroups = (indexesToDelete: number[]) => {
		indexesToDelete = sortBy(indexesToDelete).reverse();
		let newCheckedIndexes = [...checkedIndexes];

		indexesToDelete.forEach((indexToDelete) => {
			const indexPosition = newCheckedIndexes.findIndex((i) => i === indexToDelete);

			if (indexPosition !== -1) {
				newCheckedIndexes.splice(indexPosition, 1);
			}
			newCheckedIndexes = newCheckedIndexes.map((i) => (i < indexToDelete ? i : (i - 1)));
		});
		setCheckedIndexes(newCheckedIndexes);

		if (highlightedIndex !== -1 && indexesToDelete.includes(highlightedIndex)) {
			clearHighlightedIndex();
		}
	};

	useEffect(() => {
		if (overrides.length > indexedOverrides.length) {
			// overrides length increased as new overrides were added
			const newCheckedIndexes = Array.from({ length: overrides.length - indexedOverrides.length }, (el, i) => i + indexedOverrides.length);
			setCheckedIndexes(_.union(checkedIndexes, newCheckedIndexes));
		}
		if (overrides.length < indexedOverrides.length) {
			const deletedIndexes = [];
			const idsToKeep = overrides.map((o) => (o.group as Group)._id);
			indexedOverrides.forEach(({ group, index }) => {
				if (!idsToKeep.includes((group as Group)._id)) {
					deletedIndexes.push(index);
				}
			});
			handleDeleteGroups(deletedIndexes);
		}
		setIndexedOverrides(_.sortBy(addIndex(overrides || []), 'prefix'));
	}, [overrides]);

	useEffect(() => {
		onSelectedGroupsChange(checkedIndexes);
	}, [checkedIndexes]);

	return (
		<TicketGroupsContext.Provider
			value={{
				...contextValue,
				deleteGroup: (index) => onDeleteGroups([index]),
				deleteCollection: onDeleteGroups,
				editGroup: onEditGroup,
				getGroupIsChecked,
				setGroupIsChecked,
				setCollectionIsChecked,
				getCollectionState,
				indexedOverrides,
				highlightedIndex,
				clearHighlightedIndex,
			}}
		>
			{children}
		</TicketGroupsContext.Provider>
	);
};

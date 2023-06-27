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
import _ from 'lodash';
import { useEffect, useState } from 'react';
import { TicketGroupsContext } from './ticketGroupsContext';
import { GroupState, IndexedOverride, addIndex } from './ticketGroupsContext.helper';

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
	onEditGroup,
	...contextValue
}: TicketGroupsContextComponentProps) => {
	// overrides should arrive already indexed
	const [indexedOverrides, setIndexedOverrides] = useState<IndexedOverride[]>(_.sortBy(addIndex(overrides), 'prefix'));
	const [selectedIndexes, setSelectedIndexes] = useState<Set<number>>(new Set(indexedOverrides.map((o, i) => i)));

	const getGroupState = (index) => selectedIndexes.has(index);

	const toggleGroupState = (index) => {
		if (selectedIndexes.has(index)) {
			selectedIndexes.delete(index);
		} else {
			selectedIndexes.add(index);
		}
		setSelectedIndexes(new Set(selectedIndexes));
	};

	const getCollectionState = (indexes = []) => {
		if (!indexes.length) return GroupState.UNCHECKED;
		const firstDescendantState = getGroupState(indexes[0]);
		if (!indexes.every((index) => getGroupState(index) === firstDescendantState)) return GroupState.INDETERMINATE;
		return firstDescendantState ? GroupState.CHECKED : GroupState.UNCHECKED;
	};

	const toggleCollectionState = (indexes = []) => {
		if (getCollectionState(indexes) === GroupState.CHECKED) {
			indexes.forEach((i) => selectedIndexes.delete(i));
		} else {
			indexes.forEach((i) => selectedIndexes.add(i));
		}
		setSelectedIndexes(new Set(selectedIndexes));
	};

	const deleteGroup = (index) => {
		selectedIndexes.delete(index);
		const shiftedIndexes = Array.from(selectedIndexes).map((idx) => (idx < index ? idx : idx - 1));
		setSelectedIndexes(new Set(shiftedIndexes));
		onDeleteGroup(index);
	};

	useEffect(() => {
		const newIndexedOverrides = addIndex(overrides || []);
		if (overrides.length > indexedOverrides.length) {
			// overrides length increased as new overrides were added
			const indexesToSelect = Array.from({ length: overrides.length - indexedOverrides.length }, (el, i) => i + indexedOverrides.length);
			indexesToSelect.forEach((i) => selectedIndexes.add(i));
			setSelectedIndexes(new Set(selectedIndexes));
		}
		setIndexedOverrides(_.sortBy(newIndexedOverrides, 'prefix'));
	}, [overrides]);

	useEffect(() => {
		if (!onSelectedGroupsChange) return;
		const selectedOverrides = Array.from(selectedIndexes).map((index) => indexedOverrides[index]);
		onSelectedGroupsChange(selectedOverrides);
	}, [selectedIndexes]);

	return (
		<TicketGroupsContext.Provider
			value={{
				...contextValue,
				deleteGroup,
				editGroup: onEditGroup,
				getGroupState,
				toggleGroupState,
				toggleCollectionState,
				getCollectionState,
				indexedOverrides,
			}}
		>
			{children}
		</TicketGroupsContext.Provider>
	);
};

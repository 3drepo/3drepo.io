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
	onSelectedGroupsChange?: (indexes: number[]) => void,
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
	const [checkedIndexes, setCheckedIndexes] = useState<number[]>(overrides.map((o, i) => i));

	const getGroupIsChecked = (index) => checkedIndexes.includes(index);

	const toggleGroup = (index) => setCheckedIndexes(_.xor(checkedIndexes, [index]));

	const getCollectionState = (indexes = []) => {
		if (!indexes.length) return GroupState.UNCHECKED;
		const firstDescendantState = getGroupIsChecked(indexes[0]);
		if (!indexes.every((index) => getGroupIsChecked(index) === firstDescendantState)) return GroupState.INDETERMINATE;
		return firstDescendantState ? GroupState.CHECKED : GroupState.UNCHECKED;
	};

	const toggleCollection = (indexes = []) => setCheckedIndexes(
		getCollectionState(indexes) === GroupState.CHECKED
			? _.without(checkedIndexes, ...indexes)
			: _.union(checkedIndexes, indexes),
	);

	const deleteGroup = (index) => {
		const newSelectedIndexes = _.without(checkedIndexes, index).map((idx) => (idx < index ? idx : idx - 1));
		setCheckedIndexes(newSelectedIndexes);
		onDeleteGroup(index);
	};

	useEffect(() => {
		if (overrides.length > indexedOverrides.length) {
			// overrides length increased as new overrides were added
			const newIndexesToSelect = Array.from({ length: overrides.length - indexedOverrides.length }, (el, i) => i + indexedOverrides.length);
			setCheckedIndexes(_.union(checkedIndexes, newIndexesToSelect));
		}
		setIndexedOverrides(_.sortBy(addIndex(overrides || []), 'prefix'));
	}, [overrides]);

	useEffect(() => { onSelectedGroupsChange(checkedIndexes); }, [checkedIndexes]);

	return (
		<TicketGroupsContext.Provider
			value={{
				...contextValue,
				deleteGroup,
				editGroup: onEditGroup,
				getGroupIsChecked,
				toggleGroup,
				toggleCollection,
				getCollectionState,
				indexedOverrides,
			}}
		>
			{children}
		</TicketGroupsContext.Provider>
	);
};

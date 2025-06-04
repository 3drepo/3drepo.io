/**
 *  Copyright (C) 2025 3D Repo Ltd
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

import { ResizableTableContext } from '@controls/resizableTableContext/resizableTableContext';
import { ResizableEvent } from '@controls/resizableTableContext/resizableTableContext.types';
import { useContext } from 'react';
import { Resizer } from './resizer/resizer.component';
import { useResizableState } from '@controls/resizableTableContext/resizableTableContext.hooks';

export const ResizersOverlay = () => {
	const { getVisibleSortedColumnsNames } = useContext(ResizableTableContext);
	const visibleSortedColumnsNames = useResizableState(
		[ResizableEvent.VISIBLE_COLUMNS_CHANGE, ResizableEvent.WIDTH_CHANGE],
		getVisibleSortedColumnsNames,
	);

	return (
		<>
			{visibleSortedColumnsNames.map((name) => (
				<Resizer name={name} key={name} />
			))}
		</>
	);
};
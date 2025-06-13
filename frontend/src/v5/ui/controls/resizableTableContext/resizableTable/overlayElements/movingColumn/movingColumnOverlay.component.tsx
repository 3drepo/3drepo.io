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

import { MovingColumnHighlighter } from '@controls/resizableTableContext/resizableTable/overlayElements/movingColumn/movingColumnHighlighter/movingColumnHighlighter.component';
import { ResizableTableContext } from '@controls/resizableTableContext/resizableTableContext';
import { MovingColumnDropAreas } from './movingColumnDropAreas/movingColumnDropAreas.component';
import { useContextWithCondition } from '@/v5/helpers/contextWithCondition/contextWithCondition.hooks';

export const MovingColumnOverlay = () => {
	const { movingColumn } = useContextWithCondition(ResizableTableContext, (curr, prev) => !curr.movingColumn !== !prev.movingColumn);

	if (!movingColumn) return null;

	return (
		<>
			<MovingColumnDropAreas />
			<MovingColumnHighlighter />
		</>
	);
};
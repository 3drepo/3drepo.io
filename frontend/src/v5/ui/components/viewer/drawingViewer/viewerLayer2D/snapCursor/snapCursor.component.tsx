/**
 *  Copyright (C) 2024 3D Repo Ltd
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
import { SnapType } from '../../snapping/types';
import { CursorEdge, CursorIntersection, CursorNode, CursorNone } from './snapCursor.styles';
import { useMousePosition, useScale } from '../../drawingViewer.service.hooks';

const CursorIcon = {
	[SnapType.NONE]: CursorNone,
	[SnapType.NODE]: CursorNode,
	[SnapType.INTERSECTION]: CursorIntersection,
	[SnapType.EDGE]: CursorEdge,
};

type CursorProps = { snapType: SnapType };
export const SnapCursor = ({ snapType }: CursorProps) => {
	const Cursor = CursorIcon[snapType];
	const mousePosition = useMousePosition();
	const scale = useScale();

	console.log(JSON.stringify({loc: 'snap', scale, mousePosition}));

	if (!mousePosition) return null;

	return (
		<Cursor
			transform={`
				translate(${mousePosition[0]} ${mousePosition[1]})
				scale(${1 / scale})
			`}
			
			transform-origin="50% 50%"
		/>
	);
};

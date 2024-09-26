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

import ControlPoint2d from '@assets/icons/viewer/2d/control_point_2d.svg';
import IntersectionCorner from '@assets/icons/viewer/2d/intersection_corner.svg';
import EdgeLine from '@assets/icons/viewer/2d/edge_line.svg';
import Surface from '@assets/icons/viewer/2d/surface.svg';

import styled, { css } from 'styled-components';

const cursorStyle = css`
	width: 20px;
	height: 20px;
	top: -10px;
	left: -10px;
	position: absolute;
`;

export const CursorNode = styled(ControlPoint2d)`
	${cursorStyle}
	color: ${({ theme }) => theme.palette.tertiary.light};
`;

export const CursorIntersection = styled(IntersectionCorner)`
	${cursorStyle}
	color: ${({ theme }) => theme.palette.primary.main};
`;

export const CursorEdge = styled(EdgeLine)`
	${cursorStyle}
	color: ${({ theme }) => theme.palette.tertiary.light};
`;

export const CursorNone = styled(Surface)`
	${cursorStyle}
	color: ${({ theme }) => theme.palette.base.light};
`;

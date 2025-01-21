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

import styled, { css, keyframes } from 'styled-components';

const popupAnimation = keyframes`
	0% {
		transform: scale(.9);
	} 19% {
		transform: scale(.6);
	} 75% {
		transform: scale(1.5);
	} 90% {
		transform: scale(.9);
	} 100% {
		transform: scale(1.1);
	}
`;

export const PinContainer = styled.div<{ height, width, colour, position, selected?: boolean }>`
	position: absolute;
	display: flex;
	height: ${({ height }) => height}px;
	width: ${({ width }) => width}px;
	left: ${({ position, width }) => position[0] - width / 2}px;
	top: ${({ position, height }) => position[1] - height}px;
	color: rgb(${({ colour }) => colour.map((val) => Math.round(val * 256)).join()});
	
	${({ selected }) => selected && css`
		transform-origin: bottom center;
		animation: ${popupAnimation} .8s forwards;

		#selectionFill {
			stroke-width: 7px;
		}
	`}

	svg {
		height: ${({ height }) => height}px;
		width: ${({ width }) => width}px;
		stroke: #000;
		stroke-width: 2%;
		overflow: visible;
	}
`;

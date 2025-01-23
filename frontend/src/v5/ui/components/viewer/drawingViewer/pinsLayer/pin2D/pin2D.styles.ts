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
		transform: scale(1);
		top: -64px;
	} 20% {
		transform: scale(.5);
	} 38% {
		top: -64px;
	} 48% {
		top: -59px;
	} 50% {
		transform: scale(2);
	} 63% {
		top: -84x;
	} 78% {
		top: -60px;
	} 86% {
		transform: scale(1.3);
	} 100% {
		top: -64px;
		transform: scale(1.5);
	}
`;

export const PinContainer = styled.div<{ colour, selected?: boolean }>`
	position: absolute;
	color: rgb(${({ colour }) => colour.map((val) => Math.round(val * 256)).join()});

	svg {
		${({ selected }) => selected && css`
			transform-origin: bottom center;
			animation: ${popupAnimation} 1s forwards;
	
			#selectionFill {
				stroke-width: 7px;
			}
		`}
		position: absolute;
	
		left: -25px;
		top: -64px;

		stroke: #000;
		stroke-width: 2%;
		overflow: visible;
	}
`;

/**
 *  Copyright (C) 2021 3D Repo Ltd
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
import { createGlobalStyle } from 'styled-components';
import { COLOR } from '@/v4/styles/colors';

export const GlobalStyle = createGlobalStyle`
	html, body {
		height: 100%;
		position: relative;
		overflow-y: hidden;
	}

	body {
		margin: 0;
		padding: 0;
		${({ theme }) => theme.typography.body1};
	}

	#app {
		height: 100%;
		display: flex;
		flex-direction: column;
	}

	a {
		color: currentColor;
	}

	#unityViewer {
		position: absolute;
		height: 100%;
		width: 100% !important;
		overflow: hidden;
		background: ${COLOR.TRANSPARENT} !important;
	}

	.emscripten {
		background: ${COLOR.TRANSPARENT} !important;
	}

	div#unityViewer.emscripten canvas {
		background: ${COLOR.TRANSPARENT} !important;
	}

	#viewer #unityViewer canvas {
		height: 100% !important;
		width: 100% !important;
		background: ${COLOR.TRANSPARENT} !important;
	}

	// React-textarea-autocomplete
	.rta__autocomplete {
		position: absolute;
		z-index: 1400;
		display: block;
		max-width: 380px;
		background-color: ${({ theme }) => theme.palette.primary.contrast};
	}

	.rta__autocomplete--top {
		border-radius: 4px;
	}

	.rta__list {
		margin: 0;
		padding: 10px 0;
		background-color: ${({ theme }) => theme.palette.primary.contrast};
		box-shadow:
			0 5px 5px -3px rgb(0 0 0 / 20%),
			0 8px 10px 1px rgb(0 0 0 / 14%),
			0 3px 14px 2px rgb(0 0 0 / 12%);
		list-style: none;
		border-radius: 6px;
	}

	.rta__entity {
		width: 100%;
		outline: none;
	}

	.rta__entity:hover {
		cursor: pointer;
	}

	.rta__entity--selected {
		text-decoration: none;
		background-color: ${({ theme }) => theme.palette.tertiary.lightest};
	}

	// scrollbar
	* {
		box-sizing: border-box;

		&::-webkit-scrollbar,
		&::-webkit-scrollbar-thumb {
			width: 11px;
			height: 11px;
			border-radius: 11px;
			border: 3px solid transparent;
		}
	
		&:hover::-webkit-scrollbar-thumb {
			background: ${({ theme }) => theme.palette.base.lightest};
			background-clip: padding-box;
		}
	}

	button {
		cursor: pointer;
		border: none;
	}
`;

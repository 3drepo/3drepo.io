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
import { DefaultTheme } from '@mui/styles';
import { COLOR } from '@/v4/styles/colors';

export type Theme = DefaultTheme & { typography: any };

export const GlobalStyle = createGlobalStyle`
	html, body {
		height: 100%;
		position: relative;
		overflow-y: hidden;
	}

	body {
		margin: 0;
		padding: 0;
		${({ theme }: { theme: Theme }) => theme.typography.body1};
	}

	#app {
		height: 100%;
		display: flex;
		flex-direction: column;
	}

	a {
		&:link {
			text-decoration: none;
			color:inherit;
		}

		&:visited {
			text-decoration: none;
			color:inherit;
		}
		&:hover {
			text-decoration: none;
		}

		&:active { text-decoration: none; }
	}

	#viewer #unityViewer {
		position : absolute;
		height: 100% !important;
		width: 100% !important;
		overflow: hidden;
		margin-top: 72px;
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

`;

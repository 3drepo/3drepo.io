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
import { clientConfigService } from '../services/clientConfig';
import { COLOR } from './colors';

const appBackgroundImage = clientConfigService.getCustomBackgroundImagePath() || '/assets/images/viewer_background.png';

export const GlobalStyle = createGlobalStyle`
	* {
		font-family: Inter, 'Helvetica Neue', sans-serif;
		font-size: 100%;
	}

	html, body {
		height: 100%;
		position: relative;
		-webkit-tap-highlight-color: ${COLOR.BLACK};
		-webkit-touch-callout: none;
		min-height: 100%;
		-webkit-text-size-adjust: 100%;
		-ms-text-size-adjust: 100%;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
		/* NOTE: Do not set overflow:hidden here */
	}

	body {
		margin: 0;
		padding: 0;
	}

	select,
	button,
	textarea,
	input {
		vertical-align: baseline;
	}

	input[type="reset"],
	input[type="submit"],
	html input[type="button"],
	button {
		cursor: pointer;
		-webkit-appearance: button;

		&[disabled] {
			cursor: default;
		}
	}

  #app {
		flex: 1;
		display: flex;
		min-height: 100%;
		max-height: 100%;
		background: url(${appBackgroundImage}) no-repeat;
		background-size: cover;
	}

	html, body {
		background: ${COLOR.CLOUD};
	}

	#viewer #unityViewer {
		position : absolute;
		height: 100% !important;
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

	/* simplebar */

	[data-simplebar=init] > .simplebar-scroll-content > .simplebar-content,
	[data-simplebar=init] > .simplebar-scroll-content {
		min-height: 100%;
	}

	[data-simplebar=init][data-simplebar-x-hidden] > .simplebar-scroll-content > .simplebar-content {
		overflow-x: hidden;
	}

	[data-simplebar=init][data-simplebar-x-hidden] > .simplebar-track.horizontal{
		display: none;
	}

	[data-simplebar=init][data-simplebar-y-hidden] > .simplebar-scroll-content > .simplebar-content {
		overflow-y: hidden !important;
	}

	[data-simplebar=init][data-simplebar-y-hidden] > .simplebar-track.vertical {
		display: none;
	}

	.rta__autocomplete {
		position: absolute;
		z-index: 1400;
		display: block;
		margin-top: 1em;
		max-width: 380px;
	}

	.rta__autocomplete--top {
		margin-top: 0;
		margin-bottom: 1em;
	}

	.rta__list {
		margin: 0;
		padding: 0;
		background: ${COLOR.WHITE};
		border: 1px solid ${COLOR.BLACK_30};
		border-radius: 3px;
		box-shadow: 0 0 5px rgba(27, 31, 35, 0.1);
		list-style: none;
	}

	.rta__entity {
		width: 100%;
		outline: none;
	}

	.rta__entity:hover {
		cursor: pointer;
	}

	.rta__item:not(:last-child) {
		border-bottom: 1px solid ${COLOR.BLACK_30};
	}

	.rta__entity--selected {
		text-decoration: none;
		background: ${COLOR.BLACK_12};
	}
`;

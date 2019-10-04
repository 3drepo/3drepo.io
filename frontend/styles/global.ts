import { createGlobalStyle } from 'styled-components';
import { clientConfigService } from '../services/clientConfig';
import { COLOR } from './colors';

const appBackgroundImage = clientConfigService.getCustomBackgroundImagePath() || '/images/viewer_background.png';

// tslint:disable-next-line: no-unused-expression
export const GlobalStyle = createGlobalStyle`
	* {
		font-family: Roboto, 'Helvetica Neue', sans-serif;
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
`;

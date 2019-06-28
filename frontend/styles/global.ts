import { injectGlobal } from 'styled-components';
import { COLOR } from './colors';
import { FONT_WEIGHT } from './fonts';

// tslint:disable-next-line: no-unused-expression
injectGlobal`
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

	@font-face {
		font-family: 'Material Icons';
		font-style: normal;
		font-weight: ${FONT_WEIGHT.NORMAL};
		src: url('../node_modules/material-design-icons/iconfont/MaterialIcons-Regular.eot'); /* For IE6-8 */
		src: local('Material Icons'),
		local('MaterialIcons-Regular'),
		url('../node_modules/material-design-icons/iconfont/MaterialIcons-Regular.woff2') format('woff2'),
		url('../node_modules/material-design-icons/iconfont/MaterialIcons-Regular.woff') format('woff'),
		url('../node_modules/material-design-icons/iconfont/MaterialIcons-Regular.ttf') format('truetype');
	}

  #app {
		flex: 1;
		display: flex;
		min-height: 100%;
		max-height: 100%;
		background: url('/images/viewer_background.png') no-repeat;
		background-size: cover;
	}

	.angular-material-icons,
	.material-icons {
		font-family: 'Material Icons';
		font-weight: normal;
		font-style: normal;
		font-size: 24px;  /* Preferred icon size */
		display: inline-block;
		line-height: 1;
		text-transform: none;
		letter-spacing: normal;
		word-wrap: normal;
		white-space: nowrap;
		direction: ltr;

		/* Support for all WebKit browsers. */
		-webkit-font-smoothing: antialiased;
		/* Support for Safari and Chrome. */
		text-rendering: optimizeLegibility;

		/* Support for Firefox. */
		-moz-osx-font-smoothing: grayscale;

		/* Support for IE. */
		font-feature-settings: 'liga';
	}

	html, body {
		background: #cfcdcc;
	}

	.connection {
		position: absolute;
		left: 0;
		bottom: 0;
		background: #848484;
		color: white;
		padding: 4px;
		display: none;
		border-top-right-radius: 4px;
	}

	.offline {
		display: block;
		background-color: #d34a4a;
	}

	.online {
		display: block;
		background-color: #4AD36B;
	}

	#viewer .loadingViewer {
    position: absolute;
    top: 0;
    left: 0;
    font-size: 36px;
    text-align: center;
    pointer-events: none;
    width: 100%;
    height: 100%;
	}

	#viewer .loadingViewerText {
		text-shadow: 1px 1px ${COLOR.BLACK_30};
		color: ${COLOR.WHITE};
		padding-top: 40vh;
	}


	#viewer .unityProgressBar {
		position: absolute;
		top: 0;
		left: 0;
		height: 3px;
		border-bottom: solid 1px #bd0000;
		background-color: ${COLOR.RED};
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
`;

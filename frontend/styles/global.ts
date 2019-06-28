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

	.close-icon {
		margin-left: 13px;
			margin-top: 13px;
			color: white;
	}

	.focus-button {
		height: 50px;
		width: 50px;
		margin: 15px !important;
		position: absolute;
		z-index: 1000000000000;
		border-radius: 30px;
		background: rgb(6,86,60);
		top: 0;
		right: 0;
		cursor: pointer;
		display: none;
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

	/* Material ui overrides */

	.threeDRepo md-chip-template   {
		font-weight: 400;
		font-size: 13px;
	}

	.threeDRepo  .md-chips.md-removable md-chip .md-chip-content{
		padding-right: 8px;
	}

	.threeDRepo .md-chips md-chip .md-chip-remove md-icon {
		min-width: 0px;
		min-height: 0px;
		width:14px;
		height:14px;
		color: #eaeaea;
	}

	.threeDRepo .md-chips md-chip .md-chip-remove {
		background: rgba(0, 0, 0, 0.87);
		width: 16px;
		height: 16px;
		border-radius: 8px;
		opacity: .4;
	}

	.threeDRepo .md-chips md-chip .md-chip-remove:hover {
		opacity: .54;
	}

	.threeDRepo .md-chips md-chip .md-chip-remove-container {
		margin:9px;
		line-height: 0px;
	}


	.threeDRepo  md-menu-item ng-include>.md-button {
			text-align: left;
			display: inline-block;
			border-radius: 0;
			margin: auto 0;
			font-size: 15px;
			text-transform: none;
			font-weight: 400;
			height: 100%;
			padding-left: 16px;
			padding-right: 16px;
		width: 100%;
	}

	.threeDRepo md-menu-item> ng-include {
			width: 100%;
			margin: auto 0;
		padding: 0px;
	}

	.threeDRepo md-menu-item ng-include>.md-button md-icon {
			margin: auto 16px auto 0;
	}


	.threeDRepo md-menu-item ng-include p {
			display: inline-block;
			margin: auto;
			margin-top: auto;
			margin-right: auto;
			margin-bottom: auto;
			margin-left: auto;
	}

	.threeDRepo md-menu-bar {
		padding: 0px;
	}

	.threeDRepo md-menu-bar md-menu.md-open> .md-button {
		background-color: #3171B6;
	}

	.threeDRepo md-menu-item p {
		white-space: pre-wrap;
	}
`;

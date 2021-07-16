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

declare global {
	const ClientConfig: any;

	interface Window {
		Module: any;
		zxcvbn: any;
		io: any;
		ClientConfig: any;
		TDR: any;
		UnityUtil: any;
		Viewer: any;
		Pin: any;
		requestIdleCallback: any;
		__REDUX_DEVTOOLS_EXTENSION__: any;
		__RESELECT_TOOLS__: any;
	}

	interface Document {
		webkitCancelFullScreen: () => void;
	}

	interface Document {
		webkitCancelFullScreen: () => void;
	}

	interface HTMLElement {
		webkitRequestFullscreen: () => void;
	}
}

export {};

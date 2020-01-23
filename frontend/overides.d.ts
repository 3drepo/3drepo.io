declare global {
	const angular: ng.IAngularStatic;
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

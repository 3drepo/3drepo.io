declare global {
	const angular: ng.IAngularStatic;
}
declare global {
	const ClientConfig: any;
	interface Window {
		Module: any;
		zxcvbn: any;
		ClientConfig: any;
		TDR: any;
		UnityUtil: any;
		Viewer: any;
		Pin: any;
		requestIdleCallback: any;
	}
}
export {};

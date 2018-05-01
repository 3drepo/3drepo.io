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
	}
}
export {};
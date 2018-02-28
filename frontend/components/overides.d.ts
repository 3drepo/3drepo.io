declare global {
	const angular: ng.IAngularStatic;
}
declare global {
	const ClientConfig: any;
	interface Window {
		Module: any;
		zxcvbn: any;
		ClientConfig: any;
	}
}
export {};

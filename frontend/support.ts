import UnsupportedBrowserDetection from './services/unsupportedBrowserDetection';

const detection = new UnsupportedBrowserDetection();

window.onload = () => {
	document.documentElement.className += ` device-${detection.deviceType}`;

	if (detection.isInAppBrowser) {
		document.documentElement.className += ' in-app-browser';
	}

	if (!detection.isSupported()) {
		document.documentElement.className += ' unsupported';
		const pageElement =  document.getElementsByClassName('unsupported-page')[0] as HTMLElement;
		pageElement.style.visibility = 'visible';
	}
};

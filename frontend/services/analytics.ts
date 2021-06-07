import ReactGA from 'react-ga';
import TagManager from 'react-gtm-module';

import { clientConfigService } from './clientConfig';

export const EVENT_CATEGORIES = {
	ISSUE: 'Issue',
	RISK: 'Risk',
	MODEL: 'Model'
};

export const EVENT_ACTIONS = {
	CREATE: 'create',
	EDIT: 'edit',
	VIEW: 'view'
};

class AnalyticsService {
	public init() {
		const { development, gtm } = clientConfigService;

		if (development) {
			console.debug('Development - Not loading Google Analyitics or remarketing');
		}

		if (clientConfigService && !development) {
			if (gtm && gtm.gtmId) {
				console.debug('Adding Google Tag Manager');
				TagManager.initialize(gtm);
			}
		}
	}

	public sendPageView(location, tracker = '') {
		if (!this.isGoogleAnalyticEnabled) {
			return;
		}

		if (tracker) {
			ReactGA.pageview(location.pathname, [`${tracker}.send`]);
		} else {
			ReactGA.pageview(location.pathname);
		}
	}

	public sendPageViewReferer(location) {
		this.sendPageView(location, 'referer');
	}

	public sendEvent(category, action) {
		if (!this.isGoogleAnalyticEnabled) {
			return;
		}

		ReactGA.event({ category, action });
	}

	public setUserId(userId) {
		if (!this.isGoogleAnalyticEnabled) {
			return;
		}
		ReactGA.set({ userId });
	}

	private get isGoogleAnalyticEnabled() {
		return Boolean(ReactGA.ga());
	}
}

export const analyticsService = new AnalyticsService();

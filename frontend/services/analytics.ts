import TagManager from 'react-gtm-module';

import { clientConfigService } from './clientConfig';

class AnalyticsService {
	public init() {
		const { development, gtm } = clientConfigService;

		if (development) {
			console.debug('Development - Not loading Google Analytics or remarketing');
		} else {
			if (gtm && gtm.gtmId) {
				console.debug('Adding Google Tag Manager');
				TagManager.initialize(gtm);
			}
		}
	}
}

export const analyticsService = new AnalyticsService();

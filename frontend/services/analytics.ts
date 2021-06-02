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

import ReactGA from 'react-ga';

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

const REMARKETING_SCRIPT = `
	/* <![CDATA[ */
		const google_conversion_id = !{googleConversionId};
		const google_custom_params = window.google_tag_params;
		const google_remarketing_only = true;
	/* ]]> */
`;

const CONVERSION_URL = '//www.googleadservices.com/pagead/conversion.js';

class AnalyticsService {
	public init() {
		const { development, ga: gaConfig } = clientConfigService;

		if (development) {
			console.debug('Development - Not loading Google Analyitics or remarketing');
		}

		if (clientConfigService && !development && gaConfig && gaConfig.trackId) {
			console.debug('Adding Google Analytics and Remarketing');
			this.insertGA();
			this.insertRemarketing();
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

	private insertRemarketing() {
		this.addScriptByText(REMARKETING_SCRIPT);
		this.addScriptBySrc(CONVERSION_URL);
	}

	private insertGA() {
		console.debug('Initialising GA...');
		ReactGA.initialize(clientConfigService.ga.trackId);

		const args = ['create',  clientConfigService.ga.trackId, 'auto', {}];

		if (clientConfigService.userId) {
			args[3] = { userId: clientConfigService.userId, ...args[3] };
		}

		ReactGA.ga.apply(window, args);

		const refererArgs =  args.concat([]);
		refererArgs[1] = clientConfigService.ga.refererTrackId;
		refererArgs[3] = { name: 'referer', allowLinker: true, ...args[3] };

		ReactGA.ga.apply(window, refererArgs);
		ReactGA.ga('referer.require', 'linker');
		ReactGA.ga('referer.linker:autoLink', [clientConfigService.ga.refererDomain]);
	}

	private addScriptBySrc(src) {
		const script = document.createElement('script');
		script.setAttribute('src', src);
		script.async = true;
		document.head.appendChild(script);
	}

	private addScriptByText(js) {
		const script = document.createElement('script');
		script.setAttribute('text', js);
		document.head.appendChild(script);
	}
}

export const analyticsService = new AnalyticsService();

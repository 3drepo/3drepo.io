import { clientConfigService } from './clientConfig';

declare let ga: (command, fields: any, fieldsObject?: any) => void;

export const eventCategories = {
	issue: 'Issue',
	risk: 'Risk',
	model: 'Model'
};

export const eventActions = {
	create: 'create',
	edit: 'edit',
	view: 'view'
};

export class AnalyticsService {
	constructor() {}

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

	public addScriptBySrc(src) {
		const script = document.createElement('script');
		script.setAttribute('src', src);
		script.async = true;
		document.head.appendChild(script);
	}

	public addScriptByText(js) {
		const script = document.createElement('script');
		script.setAttribute('text', js);
		document.head.appendChild(script);
	}

	public insertRemarketing() {

		const script = `
			/* <![CDATA[ */
				const google_conversion_id = !{googleConversionId};
				const google_custom_params = window.google_tag_params;
				const google_remarketing_only = true;
			/* ]]> */`;

		const src = '//www.googleadservices.com/pagead/conversion.js';

		this.addScriptByText(script);
		this.addScriptBySrc(src);
	}

	public insertGA() {
		console.debug('Initialising GA...');
		const currentDate = new Date() as any;

		/* tslint:disable */
		(function(i, s,o,g,r,a,m) {i['GoogleAnalyticsObject'] = r; i[r] = i[r] || function() {
		(i[r].q = i[r].q || []).push(arguments); }, i[r].l = 1 * currentDate; a = s.createElement(o),
		m = s.getElementsByTagName(o)[0]; a.async = 1; a.src = g; m.parentNode.insertBefore(a, m);
		})(window, document, 'script', 'https://www.google-analytics.com/analytics.js', 'ga');
		/* tslint:enable */

		const args = ['create',  clientConfigService.ga.trackId, 'auto', {}];

		if (clientConfigService.userId) {
			args[3] = Object.assign({ userId: clientConfigService.userId}, args[3]);
		}

		ga.apply(window, args);

		const refererArgs =  args.concat([]);
		refererArgs[1] = clientConfigService.ga.refererTrackId;
		refererArgs[3] = Object.assign({name: 'referer', allowLinker: true}, args[3]);

		ga.apply(window, refererArgs);
		ga('referer.require', 'linker');
		ga('referer.linker:autoLink', [clientConfigService.ga.refererDomain]);
	}

	public get isGoogleAnalyticEnabled() {
		return typeof ga !== 'undefined' && ga !== null;
	}

	public sendPageView(location, tracker = '') {
		if (!this.isGoogleAnalyticEnabled) {
			return;
		}

		const trackerName = tracker || `${tracker}.`;
		const { pathname, search } = location;
		ga(`${trackerName}send`, 'pageview', `${pathname}${search}`);
	}

	public sendPageViewReferer(location) {
		this.sendPageView(location, 'referer');
	}

	public sendEvent(event) {
		if (!this.isGoogleAnalyticEnabled) {
			return;
		}

		event.hitType = 'event';
		ga('send', event);
	}

	public setUserId(userId) {
		if (!this.isGoogleAnalyticEnabled) {
			return;
		}
		ga('set', 'userId', userId);
	}
}

export const analyticsService = new AnalyticsService();

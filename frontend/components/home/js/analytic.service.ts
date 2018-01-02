/**
 *  Copyright (C) 2016 3D Repo Ltd
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

declare const ga;

export class AnalyticService {

	public static $inject: string[] = [
		"ClientConfigService",
	];

	constructor(
		private ClientConfigService: any,
	) {
	}

	public init() {

		if (this.ClientConfigService.development) {
			console.debug("Development - Not loading Google Analyitics or remarketing");
		}

		if (this.ClientConfigService && 
			!this.ClientConfigService.development && 
			this.ClientConfigService.gaTrackId
		) {
			console.debug("Adding Google Analytics and Remarketing");
			this.insertGA();
			this.insertRemarketing();
		}

	}

	public addScriptBySrc(src) {
		const script = document.createElement("script");
		script.setAttribute("src", src);
		script.async = true;
		document.head.appendChild(script);
	}

	public addScriptByText(js) {
		const script = document.createElement("script");
		script.setAttribute("text", js);
		document.head.appendChild(script);
	}

	public insertRemarketing() {

		const script = "" + 
			"/* <![CDATA[ */" +
			" const google_conversion_id = !{googleConversionId}; " +
			" const google_custom_params = window.google_tag_params; " + 
			" const google_remarketing_only = true; " +
			"/* ]]> */";

		const src = "//www.googleadservices.com/pagead/conversion.js";

		this.addScriptByText(script);
		this.addScriptBySrc(src);

	}

	public insertGA() {
		console.debug("Initialising GA...");

		(function(i,s,o,g,r,a,m){i["GoogleAnalyticsObject"]=r;i[r]=i[r]|| function() {
		(i[r].q = i[r].q || []).push(arguments); }, i[r].l = 1 * new Date(); a = s.createElement(o),
		m = s.getElementsByTagName(o)[0]; a.async = 1; a.src = g; m.parentNode.insertBefore(a, m);
		})(window, document, "script", "https://www.google-analytics.com/analytics.js", "ga");

		if (this.ClientConfigService.userId) {
			ga("create", this.ClientConfigService.gaTrackId, "auto", { userId: this.ClientConfigService.userId });
		} else {
			ga("create", this.ClientConfigService.gaTrackId, "auto");
		}
	}

	public isGoogleAnalyticEnabled() {
		return typeof ga !== "undefined" && ga !== null;
	}

	public sendPageView(location) {
		if (!this.isGoogleAnalyticEnabled()) {
			return;
		}

		ga("send", "pageview", location.pathname + location.search);
	}

	public sendEvent(event) {
		if (!this.isGoogleAnalyticEnabled()) {
			return;
		}

		event.hitType = "event";

		ga("send", event);
	}

	public setUserId(userId) {
		if (!this.isGoogleAnalyticEnabled()) {
			return;
		}

		ga("set", "userId", userId);
	}

}

export const AnalyticServiceModule = angular
	.module("3drepo")
	.service("AnalyticService", AnalyticService);

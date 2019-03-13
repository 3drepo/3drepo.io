/**
 *  Copyright (C) 2014 3D Repo Ltd
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
import { subscribe } from '../../../helpers/migration';
import { selectIsAuthenticated, selectIsPending } from '../../../modules/auth';
import { STATIC_ROUTES } from '../../../services/staticPages';

class HomeController implements ng.IController {

	public static $inject: string[] = [
		'$scope',
		'$http',
		'$templateCache',
		'$element',
		'$interval',
		'$timeout',
		'$compile',
		'$mdDialog',
		'$window',
		'$location',
		'$document',
		'$state',

		'AuthService',
		'StateManager',
		'EventService',
		'APIService',
		'ClientConfigService',
		'SWService',
		'AnalyticService',
		'ViewerService',
		'TemplateService',
		'DialogService'
	];

	private doNotLogout;
	private legalPages;
	private loggedOutStates;
	private loggedIn;
	private loginPage;
	private isLoggedOutPage;
	private functions;
	private pointerEvents;
	private goToAccount;
	private goToUserPage;
	private firstState;
	private state;
	private query;
	private isMobileDevice;
	private legalDisplays;
	private isLegalPage;
	private page;
	private loginMessage;
	private backgroundImage;
	private topLogo;
	private shownMobileDialog;
	private isLiteMode;

	constructor(
		private $scope,
		private $http,
		private $templateCache,
		private $element,
		private $interval,
		private $timeout,
		private $compile,
		private $mdDialog,
		private $window,
		private $location,
		private $document,
		private $state,

		private AuthService,
		private StateManager,
		private EventService,
		private APIService,
		private ClientConfigService,
		private SWService,
		private AnalyticService,
		private ViewerService,
		private TemplateService,
		private DialogService
	) {
		subscribe(this, {
			isAuthenticated: selectIsAuthenticated,
			isPending: selectIsPending
		});
	}

	public $onInit() {

		this.handlePaths();

		this.setLoginPage();

		this.AnalyticService.init();
		this.SWService.init();

		// Pages to not attempt a interval triggered logout from

		this.legalPages = this.AuthService.legalPages;
		this.loggedOutStates = this.AuthService.loggedOutStates;

		this.loggedIn = false;
		this.loginPage = true;
		this.isLoggedOutPage = false;

		this.functions = this.StateManager.functions;
		this.pointerEvents = 'inherit';
		this.goToAccount = false;
		this.goToUserPage = false;

		this.firstState = true;

		// Required for everything to work
		this.state = this.StateManager.state;
		this.query = this.StateManager.query;

		this.legalDisplays = STATIC_ROUTES;
		this.legalDisplays.push({title: 'Pricing', path: 'http://3drepo.org/pricing'});
		this.legalDisplays.push({title: 'Contact', path: 'http://3drepo.org/contact/'});

		this.isLiteMode = this.getLiteModeState();
		this.handlePotentialMobile();
		this.shownMobileDialog = false;

		this.watchers();

		/**
		 * Close the dialog
		 */
		this.$scope.closeDialog = function() {
			this.$mdDialog.cancel();
		};

	}

	public watchers() {

		this.$scope.$watch(
			() => {
				return this.$location.path();
			}, () => {
				this.handlePaths();
			}
		);

		this.$scope.$watch(this.EventService.currentEvent, (event) => {
			if (event && event.type === this.EventService.EVENT.TOGGLE_ISSUE_AREA_DRAWING) {
				this.pointerEvents = event.value.on ? 'none' : 'inherit';
			}
		});

		/*
		* Watch the state to handle moving to and from the login page
		*/
		this.$scope.$watch('vm.state', (oldState, newState) => {
			const change = JSON.stringify(oldState) !== JSON.stringify(newState);

			this.loggedIn = this.AuthService.isLoggedIn();

			if ( (newState && change) || (newState && this.firstState)) {

				// If it's a legal page
				const legal = this.$state.current.name.includes('app.static');
				const loggedOutPage = this.pageCheck(this.$state.current.name, this.loggedOutStates);

				if (legal) {
					this.isLegalPage = true;
					this.isLoggedOutPage = false;
				} else if (loggedOutPage && !newState.loggedIn) {
					// If its a logged out page which isnt login
					this.isLegalPage = false;
					this.isLoggedOutPage = true;
				} else if (
					!this.AuthService.getUsername() &&
					!legal &&
					!loggedOutPage
				) {
					this.isLoggedOutPage = false;
				}

			}
		}, true);

	}

	public getLiteModeState() {
		const stored = localStorage.getItem('liteMode');
		if (stored !== undefined && stored !== null) {
			if (stored === 'false') {
				return false;
			} else if (stored === 'true') {
				return true;
			}
		}

		return false; // Default

	}

	public getSubdomain() {
		const host = this.$location.host();
		if (host.indexOf('.') < 0) {
			return '';
		}
		return host.split('.')[0];
	}

	public setLoginPage() {

		if (this.ClientConfigService.customLogins !== undefined) {

			const sub = this.getSubdomain();
			const custom = this.ClientConfigService.customLogins[sub];

			if (sub && custom) {
				if (
					custom.loginMessage
				) {
					this.loginMessage = custom.loginMessage;
				}
				if (
					custom.backgroundImage &&
					typeof custom.backgroundImage === 'string'
				) {
					this.backgroundImage = custom.backgroundImage;
				}
				if (
					custom.css
				) {
					const link = document.createElement('link');
					link.setAttribute('rel', 'stylesheet');
					link.setAttribute('type', 'text/css');
					link.setAttribute('href', custom.css);
					document.getElementsByTagName('head')[0].appendChild(link);
				}
			}

		}

		if (!this.topLogo) {
			this.topLogo = '/images/3drepo-logo-white.png';
		}
		if (!this.backgroundImage) {
			this.backgroundImage = '/images/viewer_background.png';
		}

	}

	public handlePaths() {
		// TODO: this is a bit of a hack, it would be nice to
		// include this in the StateManager
		if (this.hasTrailingSlash()) {
			this.removeTrailingSlash();
		}
	}

	public pageCheck(state, pages) {
		return pages.some((page) => {
			return state[page] === true;
		});
	}

	public handlePotentialMobile() {

		// Regex test is as recommended by Mozilla:
		// https://developer.mozilla.org/en-US/docs/Web/HTTP/Browser_detection_using_the_user_agent

		const mobile = screen.width <= 768 || /Mobi/.test(navigator.userAgent);

		// We're in mobile and it's not already in lite mode
		if (mobile && !this.isLiteMode) {
			this.DialogService.showDialog(
				'lite-dialog.html',
				this.$scope,
				event,
				false,
				null,
				false
			);
			return;
		}
	}

	public setLiteMode(onOrOff) {
		this.isLiteMode = onOrOff;
		localStorage.setItem('liteMode', onOrOff);
	}

	public useLiteMode() {
		this.setLiteMode(true);
		this.shownMobileDialog = true;
		this.DialogService.closeDialog();
	}

	public useNormalMode() {
		this.setLiteMode(false);
		this.shownMobileDialog = true;
		this.DialogService.closeDialog();
	}

	public hasTrailingSlash() {
		// Check if we have a trailing slash in our URL
		const absUrl = this.$location.absUrl();
		const trailingCheck = absUrl.substr(-1);
		if (trailingCheck === '/') {
			return true;
		}
		return false;
	}

	public removeTrailingSlash() {
		// Remove the trailing slash from the URL
		const currentPath = this.$location.path();
		const minusSlash = currentPath.slice(0, -1);
		this.$location.path(minusSlash);
	}

	public home = () => {
		this.StateManager.resetServiceStates();
		this.StateManager.goHome();
	}

	public legalDisplay(event, display) {
		this.$window.open('/' + display.value);
	}

	public onLiteModeChange = () => {
		this.$timeout(() => {
			this.setLiteMode(!this.isLiteMode);
			location.reload();
		});
	}
}

export const HomeComponent: ng.IComponentOptions = {
	bindings: {
		account: '@',
		password: '@',
		loggedInUrl: '@',
		loggedOutUrl: '@'
	},
	controller: HomeController,
	controllerAs: 'vm',
	templateUrl: 'templates/home.html'
};

export const HomeComponentModule = angular
	.module('3drepo')
	.component('home', HomeComponent);

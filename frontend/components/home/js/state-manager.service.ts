/**
 *	Copyright (C) 2014 3D Repo Ltd
 *
 *	This program is free software: you can redistribute it and/or modify
 *	it under the terms of the GNU Affero General Public License as
 *	published by the Free Software Foundation, either version 3 of the
 *	License, or (at your option) any later version.
 *
 *	This program is distributed in the hope that it will be useful,
 *	but WITHOUT ANY WARRANTY; without even the implied warranty of
 *	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *	GNU Affero General Public License for more details.
 *
 *	You should have received a copy of the GNU Affero General Public License
 *	along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import { history } from '../../../helpers/migration';

export class StateManagerService {

	public static $inject: string[] = [
		'$mdDialog',
		'$location',
		'$q',
		'$state',
		'$rootScope',
		'$timeout',
		'$window',

		'AuthService',
		'ClientConfigService',
		'CompareService',
		'GroupsService',
		'PanelService',
		'TreeService',
		'ViewerService',
		'IssuesService'
	];

	public state: any;
	private changedState: any;
	private structure: any;
	private changed: any;
	private query: any;
	private functions: any[];
	private stateChangeQueue: any[];
	private stateVars: any;

	constructor(
		private $mdDialog,
		private $location,
		private $q,
		private $state,
		private $rootScope,
		private $timeout,
		private $window,

		private AuthService: any,
		private ClientConfigService: any,
		private CompareService: any,
		private GroupsService: any,
		private PanelService: any,
		private TreeService: any,
		private ViewerService: any,
		private IssuesService: any
	) {
		this.state = {
			changing: true
		};

		this.changedState = {};
		this.structure  = ClientConfigService.structure;
		this.changed = {};
		this.state = { loggedIn : false };
		this.query = {};
		this.functions = [];
		this.stateVars = {};

		this.setupStateStack();
		this.clearChanged();
		this.stateChangeQueue = [];

	}

	public resetServiceStates() {
		// We reset the state of all our services so that
		// they're back to intial states
		this.CompareService.reset();
		this.GroupsService.reset();
		this.PanelService.reset();
		this.TreeService.reset();
		this.ViewerService.reset();
		this.IssuesService.reset();
	}

	public setupStateStack() {

		const stateStack = [this.ClientConfigService.structure];

		// Populate list of functions
		while (stateStack.length > 0) {
			const stackLength = stateStack.length;
			const parentState = stateStack[stackLength - 1];

			let functionName;

			if (parentState.functions) {
				for (let i = 0; i < parentState.functions.length; i++) {
					functionName = parentState.functions[i];

					if (this.functions.indexOf(functionName) > -1) {
						console.error('Duplicate function name when loading in StateManager : ' + functionName);
					} else {
						this.functions.push(functionName);
					}
				}
			}

			if (parentState.children) {
				for (let j = 0; j < parentState.children.length; j++) {
					stateStack.push(parentState.children[j]);
				}
			}

			stateStack.splice(0, 1);
		}

	}

	public goHome() {
		let path = '/';
		if (this.AuthService.isLoggedIn() && this.AuthService.getUsername()) {
			path = '/dashboard/teamspaces';
		}

		this.$timeout(() => {
			history.push(path);
		});
	}

	public destroy()  {
		delete this.state;
		this.state = {};
	}

	public clearChanged() {
		for (const c in this.changed) {
			if (this.changed.hasOwnProperty(c)) {
				this.changed[c] = false;
			}
		}
	}

	public compareStateChangeObjects(stateChangeA, stateChangeB) {
		return	(stateChangeA.toState === stateChangeB.toState) &&
				(stateChangeA.toParams === stateChangeB.toParams) &&
				(stateChangeA.fromState === stateChangeB.fromState) &&
				(stateChangeA.fromParams === stateChangeB.fromParams);
	}

	public startStateChange(stateChangeObject) {
		this.stateChangeQueue.push(stateChangeObject);
	}

	public handleStateChange(stateChangeObject) {

		let param;
		const fromParams = stateChangeObject.fromParams;
		const toParams   = stateChangeObject.toParams;

		// Switch off all parameters that we came from
		// but are not the same as where we are going to
		for (param in fromParams) {
			if (fromParams.hasOwnProperty(param)) {
				if (!toParams.hasOwnProperty(param)) {
					this.setStateVar(param, null);
				}
			}
		}

		for (param in toParams) {
			if (toParams.hasOwnProperty(param)) {
				if (fromParams.hasOwnProperty(param)) {
					if (fromParams[param] !== toParams[param]) {
						this.setStateVar(param, toParams[param]);
					}
				} else {
					this.setStateVar(param, toParams[param]);
				}
			}
		}

		// Loop through structure. If a parent is null, then we must clear
		// it's children
		const stateStack = [this.ClientConfigService.structure];
		const stateNameStack = ['home'];
		let clearBelow = false;

		while (stateStack.length > 0) {
			const stackLength = stateStack.length;
			const parentState = stateStack[stackLength - 1];
			const parentStateName = stateNameStack[stackLength - 1];

			if (parentStateName !== 'home' && !this.state[parentStateName]) {
				clearBelow = true;
			}

			if (parentState.children) {
				for (let i = 0; i < parentState.children.length; i++) {
					const childStateName = parentState.children[i].plugin;

					stateNameStack.push(childStateName);
					stateStack.push(parentState.children[i]);

					if (clearBelow) {
						this.setStateVar(childStateName, null);
					}
				}
			}

			stateStack.splice(0, 1);
			stateNameStack.splice(0, 1);
		}

		if (this.compareStateChangeObjects(stateChangeObject, this.stateChangeQueue[0])) {
			this.stateChangeQueue.pop();

			const functionList = this.functionsUsed();

			// If we are not trying to access a function
			// and yet there is no account set. Then
			// we need to go back to the account page if possible.
			if ((functionList.length === 0) && this.AuthService.isLoggedIn() && !this.state.account) {
				this.setStateVar('account', this.AuthService.getUsername());
			}
		} else {
			this.stateChangeQueue.pop();
			this.handleStateChange(this.stateChangeQueue[this.stateChangeQueue.length - 1]);
		}
	}

	public clearQuery(state) {
		for (const param in this.query) {
			if (this.query.hasOwnProperty(param)) {
				delete this.query[param];
			}
		}
	}

	public functionsUsed() {
		const functionList = [];

		// First loop through the list of functions
		// belonging to parent structure.
		// Only deals with functions on home directory
		if (this.structure.functions) {
			for (let i = 0; i < this.structure.functions.length; i++) {
				const functionName = this.structure.functions[i];

				if (this.state[functionName]) {
					functionList.push(functionName);
					break;
				}
			}
		}

		return functionList;

	}

	public setStateVar(letName, value) {
		if (value === null) {
			delete this.state[letName];
		} else {
			if (this.state[letName] !== value) {
				this.changedState[letName] = value;
			}
		}
		this.state[letName] = value;
	}

	public setState(stateParams) {
		// Copy all state parameters and extra parameters
		// to the state

		if (stateParams.noSet) {
			return;
		}

		for (const state in stateParams) {
			if (stateParams.hasOwnProperty(state)) {
				this.setStateVar(state, stateParams[state]);
			}
		}
	}

	public setQuery(queryParams) {
		for (const param in queryParams) {
			if (queryParams.hasOwnProperty(param)) {
				this.query[param] = queryParams[param];
			}
		}
	}

	public refreshHandler(event) {

		const confirmationMessage = 'This will reload the whole model, are you sure?';
		event.returnValue = confirmationMessage;     // Gecko, Trident, Chrome 34+
		return confirmationMessage;              // Gecko, WebKit, Chrome <34

	}

	public popStateHandler(event, account, model) {

		// the fake state has already been popped by user at this moment
		const message = 'This will go back to teamspaces page are you sure you want to continue?';
		const path = this.$location.path();

		if (path === '/' + account + '/' + model) {

			const title = 'Go back to Teamspaces?';
			this.$mdDialog.show(

				this.$mdDialog.confirm()
					.clickOutsideToClose(true)
					.title(title)
					.textContent(message)
					.ariaLabel(title + ' Dialog')
					.cancel('Cancel')
					.ok('Confirm')

			).then(
				() => {
					this.$location.path(account);
					this.resetServiceStates();
				}, () => {
					// Pass
				}
			);
		}

	}

	public setHomeState(value) {
		for (const key in value) {
			if (key !== 'updateLocation' && value.hasOwnProperty(key)) {
				this.setStateVar(key, value[key]);
			}
		}
	}

}

export const StateManagerServiceModule = angular
	.module('3drepo')
	.service('StateManager', StateManagerService);

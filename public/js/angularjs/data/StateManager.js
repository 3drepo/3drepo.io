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

angular.module('3drepo')
.service('StateManager', ['$injector', '$state', 'structure', function($injector, $state, structure) {
	var self = this;

	// Stores the Data factories associated with each plugin
	this.Data 		= {};

	// Stores the state, required as ui-router does not allow inherited
	// stateParams, and we need to dynamically generate state diagram.
	// One day this might change.
	// https://github.com/angular-ui/ui-router/wiki/URL-Routing
	this.state		= {};

	// Ui components to switch on and off
	this.ui 		= {};

	// Link between plugins and data factories
	this.pluginData	= {};

	// Link between plugin names and state changes
	this.pluginState = {};

	// Has a state variable changed. Is this necessary ?
	this.changed 	= {};

	this.clearChanged = function()
	{
		for(var i in self.changed)
			self.changed[i] = false;
	}

	self.clearChanged();

	this.registerPlugin = function(plugin, dataFactory, stateFunc)
	{
		// Inject the data factory for a plugin
		if (dataFactory) {
			this.Data[dataFactory] = $injector.get(dataFactory);

			if (plugin) {
				if (!(plugin in this.pluginData))
					this.pluginData[plugin] = [];

				this.pluginData[plugin].push(this.Data[dataFactory]);
			}
		}

		if (stateFunc)
			this.pluginState[plugin] = stateFunc;
	}

	this.refresh = function(plugin)
	{
		var dataFactories = this.pluginData[plugin];

		for(var i = 0; i < dataFactories.length; i++)
			dataFactories[i].refresh();
	}

	this.genStateName = function ()
	{
		var notFinished		= true;
		var currentChildren	= structure["children"];
		var childidx 		= 0;
		var stateName 		= "base.";	// Assume that the base state is there.

		while(childidx < currentChildren.length)
		{
			var child  = currentChildren[childidx];
			var plugin = child["plugin"];

			var pluginStateName = this.pluginState[plugin](this);

			if (pluginStateName)
			{
				stateName += pluginStateName + ".";

				if (child["children"])
					currentChildren = child["children"];
				else
					currentChildren = [];

				childidx = -1;
			}

			childidx += 1;
		}

		return stateName.substring(0, stateName.length - 1);
	}

	this.createStateVar = function(varName, value)
	{
		// TODO: Check for duplication
		this.state.varName = value;
	}

	this.setStateVar = function(varName, value)
	{
		if (!(self.state[varName] == value))
			self.changed[varName] = true;

		self.state[varName] = value;
	}

	this.setState = function(stateParams, extraParams)
	{
		var stateObj = $.extend(stateParams, extraParams);

		console.log('Setting state - ' + JSON.stringify(stateParams));

		// Copy all state parameters and extra parameters
		// to the state
		for(var i in stateObj)
		{
			if (!(i in self.state))
				self.createStateVar(i, stateObj[i]);

			self.setStateVar(i, stateObj[i]);
		}

		// Clear out anything that hasn't been set
		if (extraParams["clearState"])
			for(var i in self.state)
				if (!(i in stateObj))
					if (typeof self.state[i] == 'boolean')
						self.setStateVar(i, false);
					else
						self.setStateVar(i, null);
	}

	this.updateState = function(dontUpdateLocation)
	{
		console.log('Moving to ' + self.genStateName() + ' ...');

		var updateLocation = !dontUpdateLocation ? true: false; // In case of null
		$state.transitionTo(self.genStateName(), self.state, { location: updateLocation });
	}
}]);


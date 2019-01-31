/**
 *    Copyright (C) 2016 3D Repo Ltd
 *
 *    This program is free software: you can redistribute it and/or modify
 *    it under the terms of the GNU Affero General Public License as
 *    published by the Free Software Foundation, either version 3 of the
 *    License, or (at your option) any later version.
 *
 *    This program is distributed in the hope that it will be useful,
 *    but WITHOUT ANY WARRANTY; without even the implied warranty of
 *    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *    GNU Affero General Public License for more details.
 *
 *    You should have received a copy of the GNU Affero General Public License
 *    along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

interface IBindings {
	[key: string]: any;

	contentData: any;
	onHeightUpdate: any;
}

const bindings: IBindings = {
	contentData: '<',
	onHeightUpdate: '&'
};

class HeightSetterController implements ng.IController, IBindings {
	public static $inject: string[] = [
		'$element',
		'$timeout',
		'$scope'
	];

	public contentData;
	public onHeightUpdate;
	public styles = {} as any;

	private reactElement;
	private container;
	private headerHeight;
	private content;
	private observer;
	private initialTimeout;
	private updateHeightTimeout;

	private removeHeightWatch;

	constructor(private $element, private $timeout, private $scope) {
		this.observer = new MutationObserver(this.handleElementChange);
		this.initialTimeout = this.$timeout(() => {
			this.reactElement = this.$element.children().children();
			this.container = this.reactElement.children();
			this.headerHeight = this.container.children()[0].clientHeight;
			this.content = angular.element(this.container.children()[1]) as any;

			this.content.css('max-height', `${this.contentData.height}px`);
			this.observer.observe(this.content[0], { attributes: false, childList: true, subtree: true });

			this.removeHeightWatch = this.$scope.$watch(() => this.contentData.height, (newValue) => {
				this.content.css('max-height', `${newValue}px`);
			});
		});
	}

	get contentHeight() {
		const contentContainer = this.content[0].querySelector('.height-catcher');
		const prevContentHeight = contentContainer.prevSibling && contentContainer.prevSibling.offsetHeight;
		const footerHeight = contentContainer.nextSibling && contentContainer.nextSibling.offsetHeight;
		return contentContainer.scrollHeight + (prevContentHeight || 0) + (footerHeight || 0);
	}

	public $onInit(): void {
		this.updateHeight();
	}

	public updateHeight = () => {
		this.updateHeightTimeout = this.$timeout(() => {
			const requestedHeight = this.contentHeight + this.headerHeight;

			this.contentData.panelTakenHeight = this.headerHeight;
			this.onHeightUpdate({
				contentItem: this.contentData,
				height: requestedHeight
			});
		});
	}

	public handleElementChange = (mutationsList) => {
		const shouldUpdateHeight = mutationsList
			.some((mutation) => mutation.type === 'childList' && mutation.addedNodes.length);

		if (shouldUpdateHeight) {
			this.updateHeight();
		}
	}

	public $onDestroy() {
		this.observer.disconnect();
		this.$timeout.cancel(this.initialTimeout);
		this.$timeout.cancel(this.updateHeightTimeout);

		if (this.removeHeightWatch) {
			this.removeHeightWatch();
		}
	}
}

export const HeightSetterComponent: ng.IComponentOptions = {
	transclude: true,
	bindings,
	controller: HeightSetterController,
	controllerAs: 'vm',
	templateUrl: 'templates/height-setter.html'
};

export const HeightSetterComponentModule = angular
	.module('3drepo')
	.component('heightSetter', HeightSetterComponent);

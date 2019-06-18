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

export class DialogService {

	public static $inject: string[] = [
		'$mdDialog'
	];

	constructor(
		private $mdDialog
	) {
	}

	public newUpdate() {

		const title = 'Update Available';
		const content = `A new version of 3D Repo is available! <br> <br>
			Please reload the page for the latest version. See the latest changelog
			<a href='https://github.com/3drepo/3drepo.io/releases/latest'>here</a>.`;

		let escapable = false;

		if (escapable === undefined) {
			escapable = true;
		}

		return this.$mdDialog.show(
			this.$mdDialog.confirm()
				.clickOutsideToClose(escapable)
				.escapeToClose(escapable)
				.title(title)
				.htmlContent(content)
				.ariaLabel(title)
				.ok('Reload')
				.cancel('I\'ll reload in a moment')
		)
			.then(() => {
				window.location.reload();
			})
			.catch(() => {
				console.debug('User didn\'t reload');
			});

	}
}

export const DialogServiceModule = angular
	.module('3drepo')
	.service('DialogService', DialogService);

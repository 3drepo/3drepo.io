/**
 *  Copyright (C) 2023 3D Repo Ltd
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

// Compensates for the bars that the different browsers might have, changing their internal size
export const resizeWindow = async (driver, resolution) => {
	await driver.manage().window().setRect(resolution);
	const actualSize = await driver.executeScript('return ({ width: window.innerWidth, height: window.innerHeight})');
	const currentResolution = ({
		width: resolution.width * 2 - actualSize.width,
		height: resolution.height * 2 - actualSize.height,
	});

	await driver.manage().window().setRect(currentResolution);
};

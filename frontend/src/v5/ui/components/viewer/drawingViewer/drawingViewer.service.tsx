/**
 *  Copyright (C) 2024 3D Repo Ltd
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

import { domToPng } from 'modern-screenshot';

type GetScreenshot = () => null | Promise<string>;
const DrawingViewerServiceCreator = () => {
	let imgContainer = null;

	const getScreenshot: GetScreenshot = () => imgContainer ? domToPng(imgContainer) : null;
	const setImgContainer = (newImgContainer) => { imgContainer = newImgContainer; };

	return {
		getScreenshot,
		setImgContainer,
	};
};
export const DrawingViewerService = DrawingViewerServiceCreator();

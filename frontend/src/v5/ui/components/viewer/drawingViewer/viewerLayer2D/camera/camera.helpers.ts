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

import { Viewer as ViewerService } from '@/v4/services/viewer/viewer';

export const setCameraPos = (newPosition, currentViewpoint) => {
	const {
		up,
		// eslint-disable-next-line @typescript-eslint/naming-convention
		view_dir,
		position: pos, type } = currentViewpoint;

	const cam = {
		position: [newPosition.x,  pos[1], newPosition.y ],
		view_dir,
		up,
		type, 
		look_at: undefined, 
		orthographicSize: undefined, 
		account: undefined, 
		model: undefined,
	};

	ViewerService.setCamera(cam, false);
};
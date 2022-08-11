/**
 *  Copyright (C) 2022 3D Repo Ltd
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

import { DialogsActionsDispatchers } from '@/v5/services/actionsDispatchers/dialogsActions.dispatchers';
import { UploadFileForm } from './uploadFileForm.component';

export const uploadToContainer = ({ presetContainerId }) => {
	const f = document.createElement('input');
	f.type = 'file';
	f.onchange = (e: Event) => {
		const presetFile = (<HTMLInputElement>e.target).files[0];
		DialogsActionsDispatchers.open(UploadFileForm, {
			presetFile,
			presetContainerId,
		});
	};
	f.click();
};

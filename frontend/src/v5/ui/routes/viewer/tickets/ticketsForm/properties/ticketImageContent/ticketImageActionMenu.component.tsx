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

import { Viewer as ViewerService } from '@/v4/services/viewer/viewer';
import { getSupportedImageExtensions, convertFileToImageSrc } from '@controls/fileUploader/imageFile.helper';
import { uploadFile } from '@controls/fileUploader/uploadFile';
import { FormattedMessage } from 'react-intl';
import FileIcon from '@assets/icons/outlined/file-outlined.svg';
import { EllipsisMenu } from '@controls/ellipsisMenu';
import { DialogsActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { EllipsisMenuItemDelete, EllipsisMenuItem } from './ticketImageAction/ticketImageAction.styles';
import { ViewActionMenu } from '../ticketView/viewActionMenu/viewActionMenu.component';

export const TicketImageActionMenu = ({ value, onChange, disabled = false }) => {
	const uploadScreenshot = async () => onChange(await ViewerService.getScreenshot());

	const uploadImage = async () => {
		const file = await uploadFile(getSupportedImageExtensions());
		const imgSrc = await convertFileToImageSrc(file);
		onChange(imgSrc);
	};

	const deleteImage = () => onChange(null);

	return (
		<ViewActionMenu
			disabled={!value}
			onClick={() => DialogsActionsDispatchers.open('images', { images: [value] })}
			Icon={FileIcon}
			title={<FormattedMessage id="viewer.card.ticketView.actionMenu.image" defaultMessage="Image" />}
		>
			<EllipsisMenu disabled={disabled}>
				<EllipsisMenuItem
					title={<FormattedMessage id="viewer.card.ticketImage.action.takeScreenshot" defaultMessage="Take screenshot" />}
					onClick={uploadScreenshot}
				/>
				<EllipsisMenuItem
					title={<FormattedMessage id="viewer.card.ticketImage.action.uploadImage" defaultMessage="Upload image" />}
					onClick={uploadImage}
				/>
				<EllipsisMenuItemDelete
					title={<FormattedMessage id="viewer.card.ticketImage.action.deleteImage" defaultMessage="Delete image" />}
					onClick={deleteImage}
					hidden={!value}
				/>
			</EllipsisMenu>
		</ViewActionMenu>
	);
};

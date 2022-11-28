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
import { ActionMenuItem } from '@controls/actionMenu';
import { getSupportedImageExtensions, convertFileToImageSrc } from '@controls/fileUploader/imageFile.helper';
import { uploadFile } from '@controls/fileUploader/uploadFile';
import { MenuItem } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import AddImageIcon from '@assets/icons/outlined/add_image-outlined.svg';
import EditImageIcon from '@assets/icons/outlined/edit-outlined.svg';
import { ActionMenu, MenuItemDelete, TicketImageAction } from './ticketImageAction/ticketImageAction.styles';

const TriggerButton = ({ hasImage }) => {
	if (!hasImage) {
		return (
			<TicketImageAction>
				<AddImageIcon />
				<FormattedMessage id="viewer.card.ticketImage.action.addImage" defaultMessage="Add image" />
			</TicketImageAction>
		);
	}

	return (
		<TicketImageAction>
			<EditImageIcon />
			<FormattedMessage id="viewer.card.ticketImage.action.editImage" defaultMessage="Edit image" />
		</TicketImageAction>
	);
};

export const TicketImageActionMenu = ({ value, onChange }) => {
	const uploadScreenshot = async () => onChange(await ViewerService.getScreenshot());

	const uploadImage = async () => {
		const file = await uploadFile(getSupportedImageExtensions());
		const imgSrc = await convertFileToImageSrc(file);
		onChange(imgSrc);
	};

	const deleteImage = () => onChange(null);

	const hasImage = !!value;
	return (
		<ActionMenu TriggerButton={<div><TriggerButton hasImage={hasImage} /></div>}>
			<ActionMenuItem>
				<MenuItem onClick={uploadScreenshot}>
					<FormattedMessage id="viewer.card.ticketImage.action.createScreenshot" defaultMessage="Create screenshot" />
				</MenuItem>
				<MenuItem onClick={uploadImage}>
					<FormattedMessage id="viewer.card.ticketImage.action.uploadImage" defaultMessage="Upload image" />
				</MenuItem>
				{hasImage && (
					<MenuItemDelete onClick={deleteImage}>
						<FormattedMessage id="viewer.card.ticketImage.action.deleteImage" defaultMessage="Delete image" />
					</MenuItemDelete>
				)}
			</ActionMenuItem>
		</ActionMenu>
	);
};

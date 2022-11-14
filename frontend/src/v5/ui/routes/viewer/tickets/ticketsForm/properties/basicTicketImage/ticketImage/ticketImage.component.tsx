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

import AddImageIcon from '@assets/icons/outlined/add_image-outlined.svg';
import EditImageIcon from '@assets/icons/outlined/edit-outlined.svg';
import { FormattedMessage } from 'react-intl';
import { ActionMenuItem } from '@controls/actionMenu/actionMenuItem/actionMenuItem.component';
import { Viewer as ViewerService } from '@/v4/services/viewer/viewer';
import { addBase64Prefix, convertFileToImageSrc, getSupportedImageExtensions, stripBase64Prefix } from '@controls/fileUploader/imageFile.helper';
import { uploadFile } from '@controls/fileUploader/uploadFile';
import { useContext } from 'react';
import { useParams } from 'react-router-dom';
import { getTicketResourceUrl, isResourceId, modelIsFederation } from '@/v5/store/tickets/tickets.helpers';
import { CardContext } from '@components/viewer/cards/cardContext.component';
import { ActionMenu, MenuItem, MenuItemDelete } from '../ticketImageAction/ticketImageAction.styles';
import { TicketImageAction } from '../ticketImageAction/ticketImageAction.component';
import { BasicTicketImage, BasicTicketImageProps } from '../basicTicketImage.component';

const TriggerButton = ({ imgSrc }) => {
	if (!imgSrc) {
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

type TicketImageProps = Omit<BasicTicketImageProps, 'onEmptyImageClick' | 'imgSrc' | 'children'> & {
	value?: string;
};
export const TicketImage = ({ value, onChange, ...props }: TicketImageProps) => {
	const { props: { ticketId } } = useContext(CardContext);
	const { teamspace, project, containerOrFederation } = useParams();
	const isFederation = modelIsFederation(containerOrFederation);

	const handleImageChange = (newValue) => onChange(stripBase64Prefix(newValue));

	const uploadScreenshot = async () => handleImageChange(await ViewerService.getScreenshot());

	const uploadImage = async () => {
		const file = await uploadFile(getSupportedImageExtensions());
		const imgSrc = await convertFileToImageSrc(file);
		handleImageChange(imgSrc);
	};

	const getImgSrc = () => {
		if (!value) return '';
		if (isResourceId(value)) {
			return getTicketResourceUrl(teamspace, project, containerOrFederation, ticketId, value, isFederation);
		}
		return addBase64Prefix(value);
	};

	return (
		<BasicTicketImage imgSrc={getImgSrc()} onEmptyImageClick={uploadImage} {...props}>
			<ActionMenu TriggerButton={<div><TriggerButton imgSrc={getImgSrc()} /></div>}>
				<ActionMenuItem>
					<MenuItem onClick={uploadScreenshot}>
						<FormattedMessage id="viewer.card.ticketImage.action.createScreenshot" defaultMessage="Create screenshot" />
					</MenuItem>
					<MenuItem onClick={uploadImage}>
						<FormattedMessage id="viewer.card.ticketImage.action.uploadImage" defaultMessage="Upload image" />
					</MenuItem>
					{getImgSrc() && (
						<MenuItemDelete onClick={() => handleImageChange('')}>
							<FormattedMessage id="viewer.card.ticketImage.action.deleteImage" defaultMessage="Delete image" />
						</MenuItemDelete>
					)}
				</ActionMenuItem>
			</ActionMenu>
		</BasicTicketImage>
	);
};

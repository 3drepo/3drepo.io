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
import { TicketsCardHooksSelectors } from '@/v5/services/selectorsHooks/ticketsCardSelectors.hooks';
import AddImageIcon from '@assets/icons/outlined/add_image-outlined.svg';
import EditImageIcon from '@assets/icons/outlined/edit-outlined.svg';
import { isResourceId, getTicketResourceUrl, modelIsFederation } from '@/v5/store/tickets/tickets.helpers';
import { ActionMenuItem } from '@controls/actionMenu';
import { addBase64Prefix, convertFileToImageSrc, getSupportedImageExtensions, stripBase64Prefix } from '@controls/fileUploader/imageFile.helper';
import { uploadFile } from '@controls/fileUploader/uploadFile';
import { MenuItem } from '@mui/material';
import { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { useParams } from 'react-router-dom';
import { BasicTicketImage } from '../basicTicketImage/basicTicketImage.component';
import { TicketImageAction } from '../basicTicketImage/ticketImageAction/ticketImageAction.component';
import { ActionMenu, MenuItemDelete } from '../basicTicketImage/ticketImageAction/ticketImageAction.styles';

type ICamera = {
	type: 'perspective' | 'orthographic';
	position: number[];
	forward: number[];
	up: number[];
	size?: number;
};

type ClippingPlane = {
	normal: number[];
	distance: number[];
	clipDirection: 1 | -1;
};

type IViewpoint = {
	screenshot?: any;
	camera: ICamera;
	clippingPlanes: ClippingPlane[];
};

type ITicketView = {
	value: IViewpoint | undefined;
	label: string;
	error: boolean;
	helperText: string;
	required: boolean;
	onBlur: () => void;
	onChange: (newValue) => void;
};

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

export const TicketView = ({
	value,
	error,
	helperText,
	required,
	onBlur,
	onChange,
	...props
}: ITicketView) => {
	const { teamspace, project, containerOrFederation } = useParams();
	const ticketId = TicketsCardHooksSelectors.selectSelectedTicketId();
	const isFederation = modelIsFederation(containerOrFederation);
	const hasImage = !!value;

	const createViewpoint = async () => {
		const currentViewpoint = await ViewerService.getViewpoint();
		onChange?.(currentViewpoint);
	};
	const goToViewpoint = async () => {
		if (!value) return;
		await ViewerService.setViewpoint(value);
	};
	const deleteViewpoint = async () => {
		onChange?.(null);
	};

	const handleImageChange = (newValue) => onChange({ ...(value || {}), screenshot: stripBase64Prefix(newValue) });

	const uploadScreenshot = async () => handleImageChange(await ViewerService.getScreenshot());

	const uploadImage = async () => {
		const file = await uploadFile(getSupportedImageExtensions());
		const imgSrc = await convertFileToImageSrc(file);
		handleImageChange(imgSrc);
	};

	const deleteImage = () => handleImageChange('');

	useEffect(() => onBlur?.(), [value]);

	const getImgSrc = (imgData) => {
		if (!imgData) return '';
		if (isResourceId(imgData)) {
			return getTicketResourceUrl(teamspace, project, containerOrFederation, ticketId, value, isFederation);
		}
		return addBase64Prefix(imgData);
	};
	return (
		<BasicTicketImage
			imgSrc={getImgSrc(value?.screenshot)}
			onEmptyImageClick={uploadImage}
			{...props}
		>
			<TicketImageAction onClick={goToViewpoint} disabled={!(value?.camera)}>
				<AddImageIcon />
				<FormattedMessage id="viewer.card.ticketView.action.gotToViewpoint" defaultMessage="Go to viewpoint" />
			</TicketImageAction>
			{ !!(value?.camera) && (
				<ActionMenu TriggerButton={(
					<TicketImageAction>
						<EditImageIcon />
						<FormattedMessage id="viewer.card.ticketView.action.editViewpoint" defaultMessage="Edit viewpoint" />
					</TicketImageAction>
				)}
				>
					<MenuItem onClick={createViewpoint}>
						<FormattedMessage id="viewer.card.ticketView.action.editMenu.editViewpoint" defaultMessage="Edit viewpoint" />
					</MenuItem>
					<MenuItem onClick={deleteViewpoint}>
						<FormattedMessage id="viewer.card.ticketImage.action.editMenu.deleteViewpoint" defaultMessage="Delete viewpoint" />
					</MenuItem>
				</ActionMenu>
			)}
			{ !(value?.camera) && (
				<TicketImageAction onClick={createViewpoint}>
					<AddImageIcon />
					<FormattedMessage id="viewer.card.ticketView.action.createViewpoint" defaultMessage="Create viewpoint" />
				</TicketImageAction>
			)}
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
		</BasicTicketImage>
	);
};

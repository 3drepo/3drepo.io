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
import AddImageIcon from '@assets/icons/outlined/add_image-outlined.svg';
import EditImageIcon from '@assets/icons/outlined/edit-outlined.svg';
import { stripBase64Prefix } from '@controls/fileUploader/imageFile.helper';
import { MenuItem } from '@mui/material';
import { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { isEmpty } from 'lodash';
import { getImgSrc } from '@/v5/store/tickets/tickets.helpers';
import { BasicTicketImage } from '../basicTicketImage/basicTicketImage.component';
import { TicketImageAction } from '../basicTicketImage/ticketImageAction/ticketImageAction.component';
import { ActionMenu } from '../basicTicketImage/ticketImageAction/ticketImageAction.styles';
import { TicketImageActionMenu } from '../basicTicketImage/ticketImageActionMenu.component';

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

export const TicketView = ({
	value,
	error,
	helperText,
	required,
	onBlur,
	onChange,
	...props
}: ITicketView) => {
	const createViewpoint = async () => {
		const currentViewpoint = await ViewerService.getViewpoint();
		currentViewpoint.clippingPlanes = currentViewpoint.clippingPlanes || null;
		onChange?.(currentViewpoint);
	};

	const goToViewpoint = async () => {
		if (!value) return;
		await ViewerService.setViewpoint(value);
	};
	const deleteViewpoint = async () => {
		onChange?.(null);
	};

	const onImageChange = (newImg) => {
		const { screenshot, ...viewpoint } = value || {};
		if (!newImg && isEmpty(viewpoint)) onChange(null);
		onChange({ ...viewpoint, screenshot: newImg ? stripBase64Prefix(newImg) : null });
	};

	useEffect(() => onBlur?.(), [value]);

	const imgSrc = getImgSrc(value?.screenshot);
	return (
		<BasicTicketImage
			value={imgSrc}
			onChange={onImageChange}
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
			<TicketImageActionMenu value={imgSrc} onChange={onImageChange} />
		</BasicTicketImage>
	);
};

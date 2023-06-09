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
import EditViewpointIcon from '@assets/icons/outlined/rotate_arrow-outlined.svg';
import CreateViewpointIcon from '@assets/icons/outlined/add_circle-outlined.svg';
import GotoViewpointIcon from '@assets/icons/outlined/aim-outlined.svg';

import { stripBase64Prefix } from '@controls/fileUploader/imageFile.helper';
import { MenuItem } from '@mui/material';
import { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { isEmpty } from 'lodash';
import { getImgSrc } from '@/v5/store/tickets/tickets.helpers';
import { ActionMenuItem } from '@controls/actionMenu';
import { Viewpoint } from '@/v5/store/tickets/tickets.types';
import { getViewerState, viewpointV5ToV4 } from '@/v5/helpers/viewpoint.helpers';
import { ViewpointsActions } from '@/v4/modules/viewpoints';
import { useDispatch } from 'react-redux';
import { BasicTicketImage } from '../basicTicketImage/basicTicketImage.component';
import { ActionMenu, TicketImageAction } from '../basicTicketImage/ticketImageAction/ticketImageAction.styles';
import { TicketImageActionMenu } from '../basicTicketImage/ticketImageActionMenu.component';

type ITicketView = {
	value: Viewpoint | undefined;
	label: string;
	error: boolean;
	helperText: string;
	required: boolean;
	onBlur: () => void;
	onChange: (newValue) => void;
	onGroupsClick: () => void;
	disabled?: boolean;
};

export const TicketView = ({
	value,
	onBlur,
	onChange,
	onGroupsClick,
	disabled,
	...props
}: ITicketView) => {
	const dispatch = useDispatch();

	const updateViewpoint = async () => {
		const currentCameraAndClipping = await ViewerService.getViewpoint();
		const screenshot = stripBase64Prefix(await ViewerService.getScreenshot());
		const state = await getViewerState();
		onChange?.({ screenshot, ...currentCameraAndClipping, state });
	};

	const goToViewpoint = () => {
		dispatch(ViewpointsActions.setActiveViewpoint(null, null, viewpointV5ToV4(value)));
	};

	const deleteViewpoint = () => {
		let view = null;
		if (value?.screenshot) view = { screenshot: value.screenshot };
		onChange?.(view);
	};

	const onImageChange = (newImg) => {
		const { screenshot, ...viewpoint } = value || {};
		if (!newImg && isEmpty(viewpoint)) onChange(null);
		onChange({ ...value, screenshot: newImg ? stripBase64Prefix(newImg) : null });
	};

	useEffect(() => { setTimeout(() => { onBlur?.(); }, 200); }, [value]);

	const imgSrc = getImgSrc(value?.screenshot);
	return (
		<BasicTicketImage
			value={imgSrc}
			onChange={onImageChange}
			disabled={disabled}
			{...props}
		>
			{/* //TODO - delete after refactoring */}
			<TicketImageAction onClick={onGroupsClick}>
				<b>GROUPS</b>
			</TicketImageAction>
			<TicketImageAction onClick={goToViewpoint} disabled={disabled || !(value?.camera)}>
				<GotoViewpointIcon />
				<FormattedMessage id="viewer.card.ticketView.action.gotToViewpoint" defaultMessage="Go to viewpoint" />
			</TicketImageAction>
			{ !!(value?.camera) && (
				<ActionMenu TriggerButton={(
					<TicketImageAction disabled={disabled}>
						<EditViewpointIcon />
						<FormattedMessage id="viewer.card.ticketView.action.editViewpoint" defaultMessage="Edit viewpoint" />
					</TicketImageAction>
				)}
				>
					<ActionMenuItem>
						<MenuItem onClick={updateViewpoint}>
							<FormattedMessage id="viewer.card.ticketView.action.editMenu.updateViewpoint" defaultMessage="Update viewpoint" />
						</MenuItem>
						<MenuItem onClick={deleteViewpoint}>
							<FormattedMessage id="viewer.card.ticketImage.action.editMenu.deleteViewpoint" defaultMessage="Delete viewpoint" />
						</MenuItem>
					</ActionMenuItem>
				</ActionMenu>
			)}
			{ !(value?.camera) && (
				<TicketImageAction onClick={updateViewpoint} disabled={disabled}>
					<CreateViewpointIcon />
					<FormattedMessage id="viewer.card.ticketView.action.createViewpoint" defaultMessage="Create viewpoint" />
				</TicketImageAction>
			)}
			{ !disabled && (<TicketImageActionMenu value={imgSrc} onChange={onImageChange} />)}
		</BasicTicketImage>
	);
};

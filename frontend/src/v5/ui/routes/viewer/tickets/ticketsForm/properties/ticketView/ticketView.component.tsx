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
import CameraIcon from '@assets/icons/outlined/camera-outlined.svg';
import GroupsIcon from '@mui/icons-material/GroupWork';
import { stripBase64Prefix } from '@controls/fileUploader/imageFile.helper';
import { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { isEmpty } from 'lodash';
import { getImgSrc } from '@/v5/store/tickets/tickets.helpers';
import { Viewpoint } from '@/v5/store/tickets/tickets.types';
import { getViewerState, viewpointV5ToV4 } from '@/v5/helpers/viewpoint.helpers';
import { ViewpointsActions } from '@/v4/modules/viewpoints';
import { useDispatch } from 'react-redux';
import { EllipsisMenu } from '@controls/ellipsisMenu';
import { EllipsisMenuItem } from '@controls/ellipsisMenu/ellipsisMenuItem';
import { BasicTicketImage } from '../basicTicketImage/basicTicketImage.component';
import { EllipsisMenuItemDelete, ViewActionMenu } from '../basicTicketImage/ticketImageAction/ticketImageAction.styles';
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
	const hasCamera = !!value?.camera;
	return (
		<BasicTicketImage
			value={imgSrc}
			onChange={onImageChange}
			disabled={disabled}
			{...props}
		>
			{/* Image */}
			{!disabled && (<TicketImageActionMenu value={imgSrc} onChange={onImageChange} />)}
			{/* Camera */}
			<ViewActionMenu>
				<CameraIcon />
				<FormattedMessage id="viewer.card.ticketView.actionMenu.camera" defaultMessage="Camera" />
				<EllipsisMenu disabled={disabled}>
					<EllipsisMenuItem
						hidden={hasCamera}
						title={(<FormattedMessage id="viewer.card.ticketView.action.createViewpoint" defaultMessage="Create viewpoint" />)}
						onClick={updateViewpoint}
					/>
					<EllipsisMenuItem
						hidden={!hasCamera}
						title={(<FormattedMessage id="viewer.card.ticketView.action.gotToViewpoint" defaultMessage="Go to viewpoint" />)}
						onClick={goToViewpoint}
						disabled={!hasCamera}
					/>
					<EllipsisMenuItem
						hidden={!hasCamera}
						title={(<FormattedMessage id="viewer.card.ticketView.action.updateViewpoint" defaultMessage="Update viewpoint" />)}
						onClick={updateViewpoint}
					/>
					<EllipsisMenuItemDelete
						hidden={!hasCamera}
						title={<FormattedMessage id="viewer.card.ticketImage.action.editMenu.deleteViewpoint" defaultMessage="Delete viewpoint" />}
						onClick={deleteViewpoint}
					/>
				</EllipsisMenu>
			</ViewActionMenu>
			{/* Groups */}
			<ViewActionMenu>
				<GroupsIcon />
				<FormattedMessage id="viewer.card.ticketView.actionMenu.groups" defaultMessage="Groups" />
				<EllipsisMenu>
					{/* use conditional text for title when groups can be retreived */}
					<EllipsisMenuItem
						title={(<FormattedMessage id="viewer.card.ticketView.action.gotToViewpoint" defaultMessage="Create / Edit groups" />)}
						onClick={onGroupsClick}
					/>
				</EllipsisMenu>
			</ViewActionMenu>
		</BasicTicketImage>
	);
};

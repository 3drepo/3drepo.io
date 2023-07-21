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
import ViewpointIcon from '@assets/icons/outlined/aim-outlined.svg';
import TickIcon from '@assets/icons/outlined/tick-outlined.svg';
import { stripBase64Prefix } from '@controls/fileUploader/imageFile.helper';
import { useContext, useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { isEmpty } from 'lodash';
import { getImgSrc } from '@/v5/store/tickets/tickets.helpers';
import { Viewpoint } from '@/v5/store/tickets/tickets.types';
import { FormHelperText } from '@mui/material';
import { EllipsisMenu } from '@controls/ellipsisMenu';
import { formatMessage } from '@/v5/services/intl';
import { EllipsisMenuItem } from '@controls/ellipsisMenu/ellipsisMenuItem';
import { getViewerState, goToView } from '@/v5/helpers/viewpoint.helpers';
import { TicketContext, TicketDetailsView } from '../../../ticket.context';
import { TicketImageContent } from '../ticketImageContent/ticketImageContent.component';
import { TicketImageActionMenu } from '../ticketImageContent/ticketImageActionMenu.component';
import { PrimaryTicketButton } from '../../../ticketButton/ticketButton.styles';
import { Header, HeaderSection, Label, InputContainer, Tooltip } from './ticketView.styles';
import { CameraActionMenu } from './viewActionMenu/menus/cameraActionMenu.component';
import { GroupsActionMenu } from './viewActionMenu/menus/groupsActionMenu.component';

type ITicketView = {
	value: Viewpoint | undefined;
	label: string;
	error: boolean;
	helperText: string;
	required: boolean;
	onBlur: () => void;
	onChange: (newValue) => void;
	disabled?: boolean;
};

export const TicketView = ({
	value,
	onBlur,
	onChange,
	disabled,
	helperText,
	label,
	required,
	...props
}: ITicketView) => {
	const context = useContext(TicketContext);
	const hasViewpoint = value?.camera || value?.clippingPlanes || value?.state;

	// Viewpoint
	const updateViewpoint = async () => {
		const currentCameraAndClipping = await ViewerService.getViewpoint();
		const screenshot = stripBase64Prefix(await ViewerService.getScreenshot());
		const state = await getViewerState();
		onChange?.({ screenshot, ...currentCameraAndClipping, state });
	};

	// Image
	const onImageChange = (newImg) => {
		const { screenshot, ...viewpoint } = value || {};
		if (!newImg && isEmpty(viewpoint)) onChange(null);
		onChange({ ...value, screenshot: newImg ? stripBase64Prefix(newImg) : null });
	};

	// Camera
	const onUpdateCamera = async () => {
		const { camera } = await ViewerService.getViewpoint();
		const screenshot = stripBase64Prefix(await ViewerService.getScreenshot());
		onChange?.({ ...value, screenshot, camera });
	};

	const onDeleteCamera = async () => {
		const { camera, ...view } = value || {};
		onChange?.(isEmpty(view) ? null : view);
	};

	const onGoToCamera = async () => {
		await ViewerService.setViewpoint(value);
	};

	const goToViewpoint = async () => {
		await goToView(value);
	};

	// State
	const onDeleteGroups = () => {
		const { state, ...view } = value || {};
		onChange?.(isEmpty(view) ? null : view);
	};

	useEffect(() => { setTimeout(() => { onBlur?.(); }, 200); }, [value]);

	const onGroupsClick = () => {
		context.setDetailViewAndProps(TicketDetailsView.Groups, props);
	};

	const imgSrc = getImgSrc(value?.screenshot);

	return (
		<InputContainer disabled={disabled} required={required} {...props}>
			<Header>
				<Label>{label}</Label>
				<HeaderSection>
					{!hasViewpoint ? (
						<Tooltip title={(formatMessage({ id: 'viewer.card.button.saveCurrentView', defaultMessage: 'Save current view' }))}>
							<div hidden={disabled}>
								<PrimaryTicketButton onClick={updateViewpoint}>
									<TickIcon />
								</PrimaryTicketButton>
							</div>
						</Tooltip>
					) : (
						<Tooltip title={(formatMessage({ id: 'viewer.card.button.gotToView', defaultMessage: 'Go to view' }))}>
							<div>
								<PrimaryTicketButton onClick={goToViewpoint}>
									<ViewpointIcon />
								</PrimaryTicketButton>
							</div>
						</Tooltip>
					)}
					<EllipsisMenu disabled={!hasViewpoint}>
						<EllipsisMenuItem
							hidden={!hasViewpoint}
							title={(<FormattedMessage id="viewer.card.ticketView.action.updateViewpoint" defaultMessage="Update to current view" />)}
							onClick={updateViewpoint}
							disabled={disabled}
						/>
						<EllipsisMenuItem
							hidden={!hasViewpoint}
							title={(<FormattedMessage id="viewer.card.ticketView.action.gotToView" defaultMessage="Go to view" />)}
							onClick={goToViewpoint}
						/>
					</EllipsisMenu>
				</HeaderSection>
			</Header>
			<TicketImageContent
				value={imgSrc}
				onChange={onImageChange}
				disabled={disabled}
			>
				<TicketImageActionMenu value={imgSrc} onChange={onImageChange} disabled={disabled} />
				<CameraActionMenu
					value={value?.camera}
					disabled={disabled}
					onChange={onUpdateCamera}
					onDelete={onDeleteCamera}
					onGoTo={onGoToCamera}
				/>
				<GroupsActionMenu
					value={value?.state}
					disabled={disabled}
					onClick={onGroupsClick}
					onDelete={onDeleteGroups}
				/>
			</TicketImageContent>
			<FormHelperText>{helperText}</FormHelperText>
		</InputContainer>
	);
};

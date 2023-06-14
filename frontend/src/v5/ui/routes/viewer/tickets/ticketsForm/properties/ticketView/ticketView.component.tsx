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
import ViewpointIcon from '@assets/icons/outlined/aim-outlined.svg';
import TickIcon from '@assets/icons/outlined/tick-outlined.svg';
import GroupsIcon from '@mui/icons-material/GroupWork';
import { stripBase64Prefix } from '@controls/fileUploader/imageFile.helper';
import { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { isEmpty } from 'lodash';
import { getImgSrc } from '@/v5/store/tickets/tickets.helpers';
import { Viewpoint } from '@/v5/store/tickets/tickets.types';
import { FormHelperText } from '@mui/material';
import { EllipsisMenu } from '@controls/ellipsisMenu';
import { formatMessage } from '@/v5/services/intl';
import { EllipsisMenuItem } from '@controls/ellipsisMenu/ellipsisMenuItem';
import { ViewpointsActions } from '@/v4/modules/viewpoints';
import { getViewerState, viewpointV5ToV4 } from '@/v5/helpers/viewpoint.helpers';
import { useDispatch } from 'react-redux';
import { TicketImageContent } from '../ticketImageContent/ticketImageContent.component';
import { EllipsisMenuItemDelete } from '../ticketImageContent/ticketImageAction/ticketImageAction.styles';
import { TicketImageActionMenu } from '../ticketImageContent/ticketImageActionMenu.component';
import { ViewActionMenu } from './viewActionMenu/viewActionMenu.component';
import { PrimaryTicketButton } from '../../../ticketButton/ticketButton.styles';
import { Header, HeaderSection, Label, InputContainer, Tooltip } from './ticketView.styles';

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
	helperText,
	label,
	...props
}: ITicketView) => {
	const dispatch = useDispatch();

	const hasGroups = !!value?.state;
	const hasViewpoint = !value ? false : ![value.camera, value.clippingPlanes, value.state].some((val) => !val);

	// Viewpoint
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
		if (value?.screenshot) {
			view = { screenshot: value.screenshot };
		}
		onChange?.(view);
	};

	// Image
	const onImageChange = (newImg) => {
		const { screenshot, ...viewpoint } = value || {};
		if (!newImg && isEmpty(viewpoint)) onChange(null);
		onChange({ ...value, screenshot: newImg ? stripBase64Prefix(newImg) : null });
	};

	// Camera
	const updateCamera = async () => {
		const { camera } = await ViewerService.getViewpoint();
		const screenshot = stripBase64Prefix(await ViewerService.getScreenshot());
		onChange?.({ ...value, screenshot, camera });
	};

	const deleteCamera = async () => {
		const { camera, ...view } = value || {};
		onChange?.(view);
	};

	const goToCamera = async () => {
		await ViewerService.setViewpoint(value);
	};

	// State
	const deleteGroups = () => {
		const { state, ...view } = value || {};
		onChange?.(view);
	};

	useEffect(() => { setTimeout(() => { onBlur?.(); }, 200); }, [value]);

	const imgSrc = getImgSrc(value?.screenshot);
	const hasCamera = !!value?.camera;

	return (
		<InputContainer disabled={disabled} {...props}>
			<Header>
				<Label>{label}</Label>
				<HeaderSection>
					{!hasViewpoint ? (
						<Tooltip
							placement="right"
							title={(formatMessage({ id: 'viewer.card.button.saveCurrentView', defaultMessage: 'Save current view' }))}
						>
							<div hidden={disabled}>
								<PrimaryTicketButton onClick={updateViewpoint}>
									<TickIcon />
								</PrimaryTicketButton>
							</div>
						</Tooltip>
					) : (
						<Tooltip
							placement="right"
							title={(formatMessage({ id: 'viewer.card.button.gotToView', defaultMessage: 'Go to view' }))}
						>
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
						<EllipsisMenuItemDelete
							hidden={!hasViewpoint}
							title={<FormattedMessage id="viewer.card.ticketView.action.deleteView" defaultMessage="Delete view" />}
							onClick={deleteViewpoint}
							disabled={disabled}
						/>
					</EllipsisMenu>
				</HeaderSection>
			</Header>
			<TicketImageContent
				value={imgSrc}
				onChange={onImageChange}
				disabled={disabled}
			>
				{/* Image */}
				<TicketImageActionMenu value={imgSrc} onChange={onImageChange} disabled={disabled} />
				{/* Camera */}
				<ViewActionMenu
					disabled={!hasCamera}
					onClick={goToCamera}
					Icon={CameraIcon}
					title={<FormattedMessage id="viewer.card.ticketView.actionMenu.camera" defaultMessage="Camera" />}
				>
					<EllipsisMenu disabled={disabled && !hasCamera}>
						<EllipsisMenuItem
							hidden={hasCamera}
							title={(<FormattedMessage id="viewer.card.ticketView.action.saveCamera" defaultMessage="Save camera" />)}
							onClick={updateCamera}
						/>
						<EllipsisMenuItem
							hidden={!hasCamera}
							title={(<FormattedMessage id="viewer.card.ticketView.action.changeCamera" defaultMessage="Change camera" />)}
							onClick={updateCamera}
							disabled={disabled}
						/>
						<EllipsisMenuItem
							hidden={!hasCamera}
							title={(<FormattedMessage id="viewer.card.ticketView.action.gotToCamera" defaultMessage="Go to camera" />)}
							onClick={goToCamera}
						/>
						<EllipsisMenuItemDelete
							hidden={!hasCamera}
							title={<FormattedMessage id="viewer.card.ticketView.action.deleteCamera" defaultMessage="Delete camera" />}
							onClick={deleteCamera}
							disabled={disabled}
						/>
					</EllipsisMenu>
				</ViewActionMenu>
				{/* Groups */}
				<ViewActionMenu
					disabled={!hasGroups}
					onClick={onGroupsClick}
					Icon={GroupsIcon}
					title={<FormattedMessage id="viewer.card.ticketView.actionMenu.groups" defaultMessage="Groups" />}
				>
					<EllipsisMenu disabled={disabled && !hasGroups}>
						<EllipsisMenuItem
							title={(<FormattedMessage id="viewer.card.ticketView.action.addNewGroup" defaultMessage="Add new group" />)}
							onClick={onGroupsClick}
							disabled={disabled}
						/>
						<EllipsisMenuItem
							title={(<FormattedMessage id="viewer.card.ticketView.action.viewGroups" defaultMessage="View groups" />)}
							onClick={onGroupsClick}
							hidden={!hasGroups}
						/>
						<EllipsisMenuItemDelete
							title={(<FormattedMessage id="viewer.card.ticketView.action.deleteGroups" defaultMessage="Delete groups" />)}
							onClick={deleteGroups}
							hidden={!hasGroups}
							disabled={disabled}
						/>
					</EllipsisMenu>
				</ViewActionMenu>
			</TicketImageContent>
			<FormHelperText>{helperText}</FormHelperText>
		</InputContainer>
	);
};

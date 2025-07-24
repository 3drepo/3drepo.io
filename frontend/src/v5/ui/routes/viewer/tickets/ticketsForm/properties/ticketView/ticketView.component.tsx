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
import { useContext, useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { cloneDeep, isEmpty } from 'lodash';
import { getImgSrc } from '@/v5/store/tickets/tickets.helpers';
import { Viewpoint } from '@/v5/store/tickets/tickets.types';
import { FormHelperText } from '@mui/material';
import { EllipsisMenu } from '@controls/ellipsisMenu';
import { formatMessage } from '@/v5/services/intl';
import { EllipsisMenuItem } from '@controls/ellipsisMenu/ellipsisMenuItem';
import { getViewerState, goToView } from '@/v5/helpers/viewpoint.helpers';
import { ImagesModal } from '@components/shared/modalsDispatcher/templates/imagesModal/imagesModal.component';
import { TicketContext, TicketDetailsView } from '../../../ticket.context';
import { TicketImageContent } from '../ticketImageContent/ticketImageContent.component';
import { TicketImageActionMenu } from '../ticketImageContent/ticketImageActionMenu.component';
import { TicketButton } from '../../../ticketButton/ticketButton.styles';
import { Header, HeaderSection, Label, Tooltip } from './ticketView.styles';
import { CameraActionMenu } from './viewActionMenu/menus/cameraActionMenu.component';
import { GroupsActionMenu } from './viewActionMenu/menus/groupsActionMenu.component';
import { ViewerInputContainer } from '../viewerInputContainer/viewerInputContainer.component';
import { useSyncProps } from '@/v5/helpers/syncProps.hooks';
import { DialogsActionsDispatchers } from '@/v5/services/actionsDispatchers';

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
	const { setDetailViewAndProps } = useContext(TicketContext);
	const hasViewpoint = value?.camera;
	const imgSrc = getImgSrc(value?.screenshot);
	const [imgInModal, setImgInModal] = useState(imgSrc);
	const syncProps = useSyncProps({ images: [imgInModal] });

	// Image
	const handleImageClick = () => DialogsActionsDispatchers.open(ImagesModal, {
		onAddMarkup: disabled
			? null
			: (newValue) => onChange({ ...value, screenshot: stripBase64Prefix(newValue) }),
	}, syncProps);

	const handleNewImageUpload = (newImage, onSave) => {
		setImgInModal(newImage);
		DialogsActionsDispatchers.open(ImagesModal, {
			onClose: (newImages) => onSave(stripBase64Prefix(newImages[0])),
			onAddMarkup: setImgInModal,
		}, syncProps);
	};

	const onUpdateImage = (newValue) => {
		if (!newValue) {
			onChange({ ...value, screenshot: null });
			return;
		}

		handleNewImageUpload(newValue, (newImage) => onChange({ ...value, screenshot: newImage }));
	};

	// Viewpoint
	const updateViewpoint = async () => {
		const currentCameraAndClipping = await ViewerService.getViewpoint();
		const screenshot = await ViewerService.getScreenshot();
		const state = await getViewerState();

		handleNewImageUpload(screenshot, (newImage) => onChange({ screenshot: newImage, ...currentCameraAndClipping, state }));
	};

	// Camera
	const onUpdateCamera = async () => {
		const currentCameraAndClipping = await ViewerService.getViewpoint();
		onChange?.({ ...value, ...currentCameraAndClipping });
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
		const { state, ...view } = cloneDeep(value || {});
		state.colored = [];
		state.hidden = [];
		state.transformed = [];
		onChange?.({ state, ...view });
	};

	useEffect(() => { onBlur?.(); }, [value]);
	useEffect(() => { setImgInModal(imgSrc); }, [imgSrc]);

	const onGroupsClick = () => {
		setDetailViewAndProps(TicketDetailsView.Groups, props);
	};

	return (
		<>
			<ViewerInputContainer disabled={disabled} required={required} {...props}>
				<Header>
					<Label>
						{label}
					</Label>
					<HeaderSection>
						{!hasViewpoint ? (
							<Tooltip title={(formatMessage({ id: 'viewer.card.button.saveCurrentView', defaultMessage: 'Save current view' }))}>
								<div hidden={disabled}>
									<TicketButton variant="primary" onClick={updateViewpoint}>
										<TickIcon />
									</TicketButton>
								</div>
							</Tooltip>
						) : (
							<Tooltip title={(formatMessage({ id: 'viewer.card.button.gotToView', defaultMessage: 'Go to view' }))}>
								<div>
									<TicketButton variant="primary" onClick={goToViewpoint}>
										<ViewpointIcon />
									</TicketButton>
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
					onChange={onUpdateImage}
					disabled={disabled}
					onImageClick={handleImageClick}
				>
					<TicketImageActionMenu
						onClick={handleImageClick}
						value={imgSrc}
						onChange={onUpdateImage}
						disabled={disabled}
					/>
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
			</ViewerInputContainer>
		</>
	);
};

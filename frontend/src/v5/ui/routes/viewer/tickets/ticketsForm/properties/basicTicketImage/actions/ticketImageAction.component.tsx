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

import GoToViewpoinIcon from '@assets/icons/outlined/target-outlined.svg';
import AddViewpointIcon from '@assets/icons/outlined/add_circle-outlined';
import ChangeViewpointIcon from '@assets/icons/outlined/rotate_arrow-outlined.svg';
import { FormattedMessage } from 'react-intl';
import { ActionMenuTriggerButton } from '@controls/actionMenu';
import { ActionMenuItem } from '@controls/actionMenu/actionMenuItem/actionMenuItem.component';
import { ProjectsHooksSelectors } from '@/v5/services/selectorsHooks/projectsSelectors.hooks';
import AddImageIcon from '@assets/icons/outlined/add_image-outlined.svg';
import EditImageIcon from '@assets/icons/outlined/edit-outlined.svg';
import { useContext, useEffect, useState } from 'react';
import { isUndefined } from 'lodash';
import { HiddenImageInput, HiddenInputContainer } from '@controls/hiddenImageUploader/hiddenImageUploader.styles';
import { Viewer as ViewerService } from '@/v4/services/viewer/viewer';
import { ActionMenu, Action, MenuItem, MenuItemDelete } from './ticketImageAction.styles';
import { TicketImageActionContext } from './ticketImageActionContext';
import { getImageFromInputEvent } from '../../../../../../../controls/hiddenImageUploader/hiddenImageUploader.component';

export const GoToViewpointAction = () => (
	<TicketImageAction disabled={false} onClick={() => console.log('Go to viewpoint')}>
		<GoToViewpoinIcon />
		<FormattedMessage id="viewer.card.ticket.viewpoint.action.goToViewpoint" defaultMessage="Go to viewpoint" />
	</TicketImageAction>
);

export const ChangeViewPointAction = () => {
	const { viewPoint, setViewPoint } = useContext(TicketImageActionContext);

	if (!viewPoint) {
		return (
			<TicketImageAction onClick={() => setViewPoint("viewpoint")}>
				<AddViewpointIcon />
				<FormattedMessage id="viewer.card.ticketImage.action.createViewpoint" defaultMessage="Create viewpoint" />
			</TicketImageAction>
		);
	}

	return (
		<ActionMenu>
			<ActionMenuTriggerButton>
				<TicketImageAction onClick={() => console.log('Change viewpoint')}>
					<ChangeViewpointIcon />
					<FormattedMessage id="viewer.card.ticketImage.action.changeViewpoint" defaultMessage="Change viewpoint" />
				</TicketImageAction>
			</ActionMenuTriggerButton>
			<ActionMenuItem>
				<MenuItem>
					<FormattedMessage id="viewer.card.ticketImage.action.editViewpoint" defaultMessage="Edit viewpoint" />
				</MenuItem>
			</ActionMenuItem>
			<ActionMenuItem>
				<MenuItemDelete onClick={() => setViewPoint(null)}>
					<FormattedMessage id="viewer.card.ticketImage.action.deleteViewpoint" defaultMessage="Delete viewpoint" />
				</MenuItemDelete>
			</ActionMenuItem>
		</ActionMenu>
	);
};

export const ChangeImageAction = () => {
	const { imgSrc, setImgSrc } = useContext(TicketImageActionContext);
	const [inputId, _] = useState(`${Math.random()}`);
	
	const uploadImg = (event) => getImageFromInputEvent(event, setImgSrc);
	
	const uploadScreenshot = async () => {
		// TODO - uncomment when component is no longer required in storybook
		// const screenshot = await ViewerService.getScreenshot();
		// setImgSrc(screenshot);
	};

	const TriggerButton = () => {
		if (!imgSrc) {
			return (
				<TicketImageAction>
					<AddImageIcon />
					<FormattedMessage id="viewer.card.ticketImage.action.addImage" defaultMessage="Add Image" />
				</TicketImageAction>
			);
		}

		return (
			<TicketImageAction onClick={() => console.log('Change Image')}>
				<EditImageIcon />
				<FormattedMessage id="viewer.card.ticketImage.action.editImage" defaultMessage="Edit Image" />
			</TicketImageAction>
		);
	};

	return (
		<>
			<HiddenImageInput onChange={uploadImg} id={inputId} />
			<ActionMenu>
				<ActionMenuTriggerButton>
					<TriggerButton />
				</ActionMenuTriggerButton>
				<ActionMenuItem>
					<MenuItem onClick={uploadScreenshot}>
						<FormattedMessage id="viewer.card.ticketImage.action.createScreenshot" defaultMessage="Create screenshot" />
					</MenuItem>
					<HiddenInputContainer htmlFor={inputId}>
						<MenuItem>
							<FormattedMessage id="viewer.card.ticketImage.action.uploadImagte" defaultMessage="Upload image" />
						</MenuItem>
					</HiddenInputContainer>
					{imgSrc && (
						<MenuItemDelete onClick={() => setImgSrc(null)}>
							<FormattedMessage id="viewer.card.ticketImage.action.deleteImage" defaultMessage="Delete image" />
						</MenuItemDelete>
					)}
				</ActionMenuItem>
			</ActionMenu>
		</>
	);
};

type TicketImageActionProps = {
	onImageChange?: any;
	onClick?: any;
	children: any;
	disabled?: boolean;
};
export const TicketImageAction = ({ onImageChange, onClick, disabled: disabledInput, ...props }: TicketImageActionProps) => {
	const context = useContext(TicketImageActionContext);
	const { isAdmin } = ProjectsHooksSelectors.selectCurrentProjectDetails();
	const disabled = !isUndefined(disabledInput) ? disabledInput : !isAdmin

	const handleClick = (e) => {
		if (!disabled) {
			onClick?.(context);
		} else {
			e.preventDefault();
			e.stopPropagation();
		}
	}

	useEffect(() => {
		if (isAdmin) (onImageChange?.(context));
	}, [context.imgSrc]);

	return (<Action onClick={handleClick} disabled={disabled} {...props} />);
};
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
import AddViewpointIcon from '@assets/icons/outlined/add_circle-outlined.svg';
import ChangeViewpointIcon from '@assets/icons/outlined/rotate_arrow-outlined.svg';
import { FormattedMessage } from 'react-intl';
import { ActionMenuTriggerButton } from '@controls/actionMenu';
import { ActionMenuItem } from '@controls/actionMenu/actionMenuItem/actionMenuItem.component';
import AddImageIcon from '@assets/icons/outlined/add_image-outlined.svg';
import EditImageIcon from '@assets/icons/outlined/edit-outlined.svg';
import { useContext, useRef } from 'react';
import { HiddenInputContainer } from '@controls/formImage/hiddenImageUploader/hiddenImageUploader.styles';
import { HiddenImageInput } from '@controls/formImage/hiddenImageUploader/hiddenImageUploader.component';
import { Viewer as ViewerService } from '@/v4/services/viewer/viewer';
import { ActionMenu, MenuItem, MenuItemDelete } from './actions.styles';
import { TicketImageActionContext } from '../ticketImageActionContext';
import { TicketImageAction } from '../ticketImageAction.component';

 

export const GoToViewpointAction = () => (
	<TicketImageAction disabled={false}>
		<GoToViewpoinIcon />
		<FormattedMessage id="viewer.card.ticket.viewpoint.action.goToViewpoint" defaultMessage="Go to viewpoint" />
	</TicketImageAction>
);

export const ChangeViewpointAction = () => {
	const { viewpoint, setViewpoint } = useContext(TicketImageActionContext);

	if (!viewpoint) {
		return (
			<TicketImageAction onClick={() => setViewpoint('viewpoint')}>
				<AddViewpointIcon />
				<FormattedMessage id="viewer.card.ticketImage.action.createViewpoint" defaultMessage="Create viewpoint" />
			</TicketImageAction>
		);
	}

	return (
		<ActionMenu>
			<ActionMenuTriggerButton>
				<TicketImageAction>
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
				<MenuItemDelete onClick={() => setViewpoint(null)}>
					<FormattedMessage id="viewer.card.ticketImage.action.deleteViewpoint" defaultMessage="Delete viewpoint" />
				</MenuItemDelete>
			</ActionMenuItem>
		</ActionMenu>
	);
};

export const ChangeImageAction = () => {
	const { imgSrc, setImgSrc } = useContext(TicketImageActionContext);
	const inputId = useRef(`hidden-input-${new Date().getTime()}`);

	const uploadScreenshot = async () => {
		const screenshot = await ViewerService.getScreenshot();
		setImgSrc(screenshot);
	};

	const TriggerButton = () => {
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

	return (
		<>
			<HiddenImageInput onChange={setImgSrc} id={inputId.current} />
			<ActionMenu>
				<ActionMenuTriggerButton>
					<TriggerButton />
				</ActionMenuTriggerButton>
				<ActionMenuItem>
					<MenuItem onClick={uploadScreenshot}>
						<FormattedMessage id="viewer.card.ticketImage.action.createScreenshot" defaultMessage="Create screenshot" />
					</MenuItem>
					<HiddenInputContainer htmlFor={inputId.current}>
						<MenuItem>
							<FormattedMessage id="viewer.card.ticketImage.action.uploadImage" defaultMessage="Upload image" />
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

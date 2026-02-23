/**
 *  Copyright (C) 2025 3D Repo Ltd
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

import AddViewpointIcon from '@assets/icons/outlined/camera_side_with_plus-outlined.svg';

import { formatMessage } from '@/v5/services/intl';
import { Viewer as ViewerService } from '@/v4/services/viewer/viewer';
import { ActionMenu } from '@controls/actionMenu';
import { EllipsisMenuItem } from '@controls/ellipsisMenu/ellipsisMenuItem';
import { MenuList, Tooltip } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { ActionIcon } from '../commentBox.styles';
import { ViewpointIcon } from './viewpointActionMenu.styles';
import { getViewerState } from '@/v5/helpers/viewpoint.helpers';
import { useContext } from 'react';
import { TicketContext } from '../../../../ticket.context';

export const ViewpointActionMenu = ({ viewpoint, setViewpoint }) => {
	const { isViewer } = useContext(TicketContext);
	
	const updateViewpoint = async () => {
		const state = await getViewerState();
		const cameraAndClipping = await ViewerService.getViewpoint();
		setViewpoint({ ...cameraAndClipping, state });
	};
	const deleteViewpoint = () => setViewpoint(null);

	if (!viewpoint) return (
		<Tooltip title={formatMessage({ id: 'customTicket.comments.action.addViewpoint', defaultMessage: 'Add viewpoint' })} arrow>
			<ActionIcon>
				<AddViewpointIcon onClick={updateViewpoint} />
			</ActionIcon>
		</Tooltip>
	);
	return (
		<ActionMenu
			TriggerButton={(
				<ActionIcon>
					<ViewpointIcon />
				</ActionIcon>
			)}
		>
			<MenuList>
				<EllipsisMenuItem
					disabled={!isViewer}
					title={<FormattedMessage id="customTicket.comments.action.replaceViewpoint" defaultMessage="Replace Viewpoint" />}
					onClick={updateViewpoint}
				/>
				<EllipsisMenuItem
					title={<FormattedMessage id="customTicket.comments.action.deleteViewpoint" defaultMessage="Delete Viewpoint" />}
					onClick={deleteViewpoint}
				/>
			</MenuList>
		</ActionMenu>
	);
};
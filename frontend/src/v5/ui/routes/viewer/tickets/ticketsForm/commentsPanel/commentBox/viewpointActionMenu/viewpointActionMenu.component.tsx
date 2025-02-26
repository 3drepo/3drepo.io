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

import ViewpointIcon from '@assets/icons/outlined/camera_side-outlined.svg';
import AddViewpointIcon from '@assets/icons/outlined/camera_side_with_plus-outlined.svg';

import { formatMessage } from '@/v5/services/intl';
import { Viewer as ViewerService } from '@/v4/services/viewer/viewer';
import { ActionMenu } from '@controls/actionMenu';
import { EllipsisMenuItem } from '@controls/ellipsisMenu/ellipsisMenuItem';
import { MenuList, Tooltip } from '@mui/material';
import { FormattedMessage } from 'react-intl';

export const ViewpointActionMenu = ({ viewpoint, setViewpoint }) => {
	const updateViewpoint = async () => {
		setViewpoint(await ViewerService.getViewpoint());
	};
	const deleteViewpoint = async () => {
		setViewpoint(null);
	};

	if (!viewpoint) return (
		<Tooltip title={formatMessage({ id: 'customTicket.comments.action.useViewpoint', defaultMessage: 'Add viewpoint' })}>
			<div>
				<AddViewpointIcon onClick={setViewpoint} />
			</div>
		</Tooltip>
	);
	return (
		<ActionMenu
			TriggerButton={(
				<ViewpointIcon />
			)}
		>
			<MenuList>
				<EllipsisMenuItem
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
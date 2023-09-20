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

import CameraIcon from '@assets/icons/outlined/camera-outlined.svg';
import { FormattedMessage } from 'react-intl';
import { Camera } from '@/v5/store/tickets/tickets.types';
import { EllipsisMenu } from '@controls/ellipsisMenu';
import { EllipsisMenuItem } from '@controls/ellipsisMenu/ellipsisMenuItem';
import { useContext } from 'react';
import { EllipsisMenuItemDelete } from '../../../ticketImageContent/ticketImageAction/ticketImageAction.styles';
import { ViewActionMenu } from '../viewActionMenu.component';
import { TicketContext } from '../../../../../ticket.context';

type ICameraActionMenu = {
	value: Camera | undefined;
	disabled?: boolean;
	onChange: (newValue) => void;
	onDelete: () => void;
	onGoTo: () => void;
};

export const CameraActionMenu = ({
	value,
	onChange,
	onDelete,
	onGoTo,
	disabled,
}: ICameraActionMenu) => {
	const { isViewer } = useContext(TicketContext);
	return (
		<ViewActionMenu
			disabled={!value || !isViewer}
			onClick={onGoTo}
			Icon={CameraIcon}
			title={<FormattedMessage id="viewer.card.ticketView.actionMenu.camera" defaultMessage="Camera" />}
		>
			<EllipsisMenu disabled={(disabled && !value) || !isViewer}>
				<EllipsisMenuItem
					hidden={!!value}
					title={(<FormattedMessage id="viewer.card.ticketView.action.saveCamera" defaultMessage="Save camera" />)}
					onClick={onChange}
				/>
				<EllipsisMenuItem
					hidden={!value}
					title={(<FormattedMessage id="viewer.card.ticketView.action.changeCamera" defaultMessage="Change camera" />)}
					onClick={onChange}
					disabled={disabled}
				/>
				<EllipsisMenuItem
					hidden={!value}
					title={(<FormattedMessage id="viewer.card.ticketView.action.gotToCamera" defaultMessage="Go to camera" />)}
					onClick={onGoTo}
				/>
				<EllipsisMenuItemDelete
					hidden={!value}
					title={<FormattedMessage id="viewer.card.ticketView.action.deleteCamera" defaultMessage="Delete camera" />}
					onClick={onDelete}
					disabled={disabled}
				/>
			</EllipsisMenu>
		</ViewActionMenu>
	);
};

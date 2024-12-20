/**
 *  Copyright (C) 2018 3D Repo Ltd
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
import { PureComponent } from 'react';
import Notifications from '@mui/icons-material/Notifications';
import { EmptyItem, EmptyItemText } from './emptyItem.styles';

export class NotificationEmptyItem extends PureComponent {
	public render() {
		return (
			<EmptyItem>
				<Notifications fontSize="large" color="disabled" />
				<EmptyItemText>
					You have no new notifications.
				</EmptyItemText>
			</EmptyItem>
			);
	}
}

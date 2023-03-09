/**
 *  Copyright (C) 2023 3D Repo Ltd
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

import { UserPopover } from '@components/shared/userPopover/userPopover.component';
import { HoverPopover } from '@controls/hoverPopover/hoverPopover.component';
import { IUser } from '@/v5/store/users/users.redux';
import { UserCircle } from './userCirlcePopover.styles';

type UserCirclePopoverProps = {
	user: IUser;
	className?: string;
};
export const UserCirclePopover = ({ user, className }: UserCirclePopoverProps) => (
	<HoverPopover
		className={className}
		anchor={(props) => <UserCircle user={user} {...props} />}
	>
		<UserPopover user={user} />
	</HoverPopover>
);

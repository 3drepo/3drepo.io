/**
 *  Copyright (C) 2021 3D Repo Ltd
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
import { IUser } from '@/v5/store/users/users.redux';
import { compact } from 'lodash';
import { FormattedMessage } from 'react-intl';
import { AvatarWrapper, PopoverContainer, Employment, Username, Heading, Data } from './userPopover.styles';
import { UserCircle } from '../userPopoverCircle.styles';

interface IUserPopover {
	user: IUser;
}

export const UserPopover = ({ user }: IUserPopover) => {
	if (user.isNotTeamspaceMember) {
		return (
			<PopoverContainer>
				<Data>
					<Username>
						<FormattedMessage
							id="userPopover.noUser"
							defaultMessage="The user is not currently a teamspace member"
						/>
					</Username>
				</Data>
			</PopoverContainer>
		);
	}

	const { firstName, lastName, company, job } = user;
	return (
		<PopoverContainer>
			<AvatarWrapper>
				<UserCircle user={user} />
			</AvatarWrapper>
			<Data>
				<Heading>{firstName} {lastName}</Heading>
				<Employment>{compact([job, company]).join(', ')}</Employment>
			</Data>
		</PopoverContainer>
	);
};

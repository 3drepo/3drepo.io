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
import { ReactElement } from 'react';
import { AvatarWrapper, Container, Details, Name, UserData } from './userPopover.styles';

export interface IUser {
	user: string;
	firstName: string;
	lastName: string;
	company?: string;
	job?: {
		_id: string;
	};
}

interface IProps {
	user: IUser;
	children: ReactElement<any> | number | string;
}

export const UserPopover = ({ user: { firstName, lastName, company, job }, children }: IProps) => {
	return (
		<Container>
			<AvatarWrapper>
				{children}
			</AvatarWrapper>
			<UserData>
				<Name>{lastName}, {firstName}</Name>
				<Details>{company}</Details>
				<Details>{job?._id}</Details>
			</UserData>
		</Container>
	);
};

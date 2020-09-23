import React from 'react';

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
	children: React.ReactChild;
}

export const UserPopover = ({ user: { firstName, lastName, company, user, job }, children }: IProps) => {
	return (
		<Container>
			<AvatarWrapper>
				{children}
			</AvatarWrapper>
			<UserData>
				<Name>{lastName}, {firstName}</Name>
				<Details>{user}</Details>
				<Details>{company}</Details>
				<Details>{job?._id}</Details>
			</UserData>
		</Container>
	);
};

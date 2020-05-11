import React from 'react';

import { AvatarWrapper, Container, Details, Name, UserData } from './userPopover.styles';

export const UserPopover = ({ user: { firstName, lastName, company, user, job }, children }) => {
	return (
		<Container>
			<AvatarWrapper>
				{children}
			</AvatarWrapper>
			<UserData>
				<Name>{lastName}, {firstName}</Name>
				<Details>{user}</Details>
				<Details>{company}</Details>
				<Details>{job}</Details>
			</UserData>
		</Container>
	);
};

/**
 *  Copyright (C) 2017 3D Repo Ltd
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

import { ReactChild, ReactNode } from 'react';


import { Container, Content, Footer } from './userManagementTab.styles';

interface IProps {
	children: ReactChild;
	footerLabel?: string | ReactNode[];
	withHeader?: boolean;
}

export const UserManagementTab = (props: IProps) => {
	const {footerLabel, children} = props;
	return (
		<>
			<Container
				container
				direction="column"
				alignItems="stretch"
				wrap="nowrap"
				justifyContent="space-between"
			>
				<Content item header={props.withHeader}>{children}</Content>
				{footerLabel && (<Footer item>{footerLabel}</Footer>)}
			</Container>
		</>
	);
};

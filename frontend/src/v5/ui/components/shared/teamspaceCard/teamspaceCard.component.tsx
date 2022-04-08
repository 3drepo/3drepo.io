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

import { Link } from 'react-router-dom';
import { CardHeading, CardSubheading, Container, Content, Image, ListItem } from './teamspaceCard.styles';

interface ITeamspaceCard {
	variant?: 'primary' | 'secondary',
	name: string;
	status?: string;
	imageURL?: string;
}

export const TeamspaceCard = ({ variant = 'primary', name, status, imageURL }: ITeamspaceCard): JSX.Element => (
	<ListItem>
		<Link to={`${name}`} style={{ textDecoration: 'none' }}>
			<Container $variant={variant}>
				<Image
					component="img"
					alt={`${name} Image`}
					image={imageURL}
				/>
				<Content>
					<CardHeading>{name}</CardHeading>
					<CardSubheading>{status}</CardSubheading>
				</Content>
			</Container>
		</Link>
	</ListItem>
);

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

import { FormattedMessage } from 'react-intl';
import { AddProjectIcon, Container } from './addProjectCard.styles';
import { ListItem } from '../../linkCard.styles';

interface IAddProjectCard {
	variant?: 'primary' | 'secondary',
}

export const AddProjectCard = ({ variant = 'primary' }: IAddProjectCard): JSX.Element => (
	<ListItem>
		<a href="https://3drepo.com/pricing/" target="_blank" rel="noreferrer">
			<Container $variant={variant}>
				<AddProjectIcon />
				<FormattedMessage id="projectSelect.addNewProject" defaultMessage="New Project" />
			</Container>
		</a>
	</ListItem>
);

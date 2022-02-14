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

import React from 'react';
import AddCircleIcon from '@assets/icons/add_circle.svg';
import { FormattedMessage } from 'react-intl';
import { Container, Message } from './newContainer.styles';

export const NewContainer = ({ name }) => (
	<Container>
		<AddCircleIcon />
		<Message>
			<FormattedMessage
				id="uploads.destination.newContainer.message"
				defaultMessage="Add <Bold>{containerName}</Bold> as a new container"
				values={{
					Bold: (val: string) => <b>{val}</b>,
					containerName: name,
				}}
			/>
		</Message>
	</Container>
);

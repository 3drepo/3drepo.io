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

import { FormattedMessage } from 'react-intl';
import { Message, NewContainerOption } from './newContainerInUse.styles';
import { InUseText } from '../existingContainer/existingContainer.styles';

interface INewContainer {
	containerName: string;
}

export const NewContainerInUse = ({ containerName, ...props }: INewContainer) => (
	<NewContainerOption {...props}>
		<Message>
			<FormattedMessage
				id="uploads.destination.newContainer"
				defaultMessage=" <Bold>{containerName}</Bold> is a new container"
				values={{
					Bold: (val: string) => <b>{val}</b>,
					containerName,
				}}
			/>
		</Message>
		<InUseText >
			<FormattedMessage id="uploads.destination.containerInUse" defaultMessage="Already in use in another file upload" />
		</InUseText>
	</NewContainerOption>
);

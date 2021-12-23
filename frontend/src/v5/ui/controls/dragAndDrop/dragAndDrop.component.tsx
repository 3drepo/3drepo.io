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

import React, { ReactNode } from 'react';

import { FormattedMessage } from 'react-intl';
import { Button } from '@controls/button';
import { Typography } from '@controls/typography';
import { DropZone, HelpText } from './dragAndDrop.styles';

interface IDragAndDrop {
	message?: ReactNode,
}

export const DragAndDrop = ({ message }: IDragAndDrop) => (
	<DropZone>
		<Typography variant="h3" color="secondary">
			<FormattedMessage id="draganddrop.drop" defaultMessage="Drop files here" />
		</Typography>

		<Typography variant="h5" color="secondary">
			<FormattedMessage id="draganddrop.or" defaultMessage="or" />
		</Typography>

		<Button variant="contained" color="primary">
			<FormattedMessage id="draganddrop.browse" defaultMessage="Browse" />
		</Button>
		<HelpText>
			{message}
		</HelpText>
	</DropZone>
);

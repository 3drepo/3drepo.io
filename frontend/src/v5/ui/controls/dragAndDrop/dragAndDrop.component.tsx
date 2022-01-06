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

import React, { ReactNode, useState } from 'react';

import { FormattedMessage } from 'react-intl';
import { Typography } from '@controls/typography';
import { HelpText, UploadDialog, Container } from './dragAndDrop.styles';
import { FileInputField } from '../fileInputField/fileInputField.component';

interface IDragAndDrop {
	message?: ReactNode,
	processFiles: (files) => void,
}

export const DragAndDrop = ({ message, processFiles }: IDragAndDrop) => {
	const [dragOverlay, setDragOverlay] = useState(false);

	const handleDragIn = (e) => {
		if (e.dataTransfer.items.length > 0) {
			setDragOverlay(true);
		}
	};

	const handleDragOut = () => {
		setDragOverlay(false);
	};

	const handleDrop = (files) => {
		processFiles(files);
		setDragOverlay(false);
	};
	return (
		<Container
				onDragEnter={handleDragIn}
				onDragLeave={handleDragOut}
				onDrop={handleDrop}
			disableClick
		>
			<UploadDialog className={dragOverlay && 'drag-over'}>
				<Typography variant="h3" color="secondary">
					<FormattedMessage id="draganddrop.drop" defaultMessage="Drop files here" />
				</Typography>

				<Typography variant="h5" color="secondary">
					<FormattedMessage id="draganddrop.or" defaultMessage="or" />
				</Typography>

				<FileInputField
					handleChange={(files) => processFiles(files)}
				/>
				<HelpText>
					{message}
				</HelpText>
			</UploadDialog>
		</Container>
	);
};

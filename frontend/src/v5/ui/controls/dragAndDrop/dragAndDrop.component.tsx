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

import { useState } from 'react';
import { Container, DashedContainer, DropArea } from './dragAndDrop.styles';

interface IDragAndDrop {
	hidden?: boolean;
	onDrop: (files) => void,
	className?: string;
	children?: any;
	accept?: string;
}
export const DragAndDrop = ({ children, onDrop, hidden = false, ...props }: IDragAndDrop) => {
	const [dragOverlay, setDragOverlay] = useState(false);

	const handleDragEnter = (e) => {
		if (e.dataTransfer.items.length > 0) {
			setDragOverlay(true);
		}
	};

	const handleDragLeave = () => {
		setDragOverlay(false);
	};

	const handleDrop = (files) => {
		onDrop(files);
		setDragOverlay(false);
	};
	return (
		<DropArea hidden={hidden} disableClick onDrop={handleDrop} {...props}>
			<Container
				onDragEnter={handleDragEnter}
				onDragLeave={handleDragLeave}
			>
				<DashedContainer $dragOverlay={dragOverlay}>
					{children}
				</DashedContainer>
			</Container>
		</DropArea>
	);
};

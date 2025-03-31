/**
 *  Copyright (C) 2024 3D Repo Ltd
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

import AddValueIcon from '@assets/icons/outlined/add_circle-outlined.svg';
import RemoveValueIcon from '@assets/icons/outlined/remove_circle-outlined.svg';
import { IconContainer, Container } from './arrayFieldContainer.styles';

type ArrayFieldContainerProps = {
	children: any,
	disableRemove?: boolean,
	disableAdd?: boolean,
	onRemove: () => void,
	onAdd: () => void,
};
export const ArrayFieldContainer = ({ children, onRemove, onAdd, disableAdd, disableRemove }: ArrayFieldContainerProps) => (
	<Container>
		{children}
		<IconContainer onClick={onRemove} disabled={disableRemove}>
			<RemoveValueIcon />
		</IconContainer>
		<IconContainer onClick={onAdd} disabled={disableAdd}>
			<AddValueIcon />
		</IconContainer>
	</Container>
);
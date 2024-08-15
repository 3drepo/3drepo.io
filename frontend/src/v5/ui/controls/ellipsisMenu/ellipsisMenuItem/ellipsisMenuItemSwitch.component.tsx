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

import TickIcon from '@assets/icons/outlined/tick-outlined.svg';
import { EllipsisMenuItem, EllipsisMenuItemProps } from './ellipsisMenutItem.component';
import { ReactNode } from 'react';
import { SwitchContainer, Title } from './ellipsisMenuItem.styles';

type EllipsisMenuItemSwitchProps = Omit<EllipsisMenuItemProps, 'to'> & {
	icon: ReactNode,
	active: boolean,
};
export const EllipsisMenuItemSwitch = ({ icon, title, active, ...props }: EllipsisMenuItemSwitchProps) => (
	<EllipsisMenuItem 
		title={
			<SwitchContainer>
				{icon}
				<Title>{title}</Title>
				{/* {title} */}
				{active && <TickIcon />}
			</SwitchContainer>}
		{...props}
	/>
);

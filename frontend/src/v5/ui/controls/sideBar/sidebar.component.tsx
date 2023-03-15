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

import ExpandIcon from '@assets/icons/outlined/expand_panel-outlined.svg';
import { SidebarContainer, ExpandButton, SidebarContent } from './sidebar.styles';

interface ISidebar {
	open: boolean;
	onClick: () => void;
	className?: string;
	children: JSX.Element;
	hidden?: boolean;
}

export const Sidebar = ({
	className,
	open,
	onClick,
	children,
}: ISidebar): JSX.Element => (
	<SidebarContainer className={className} open={open}>
		<ExpandButton onClick={onClick}>
			<ExpandIcon />
		</ExpandButton>
		<SidebarContent>
			{children}
		</SidebarContent>
	</SidebarContainer>
);

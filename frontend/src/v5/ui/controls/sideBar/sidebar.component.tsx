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

import React from 'react';
import ExpandIcon from '@assets/icons/expand_panel.svg';
import { Container, Content, Button } from './sidebar.styles';

interface ISidebar {
	open: boolean;
	noButton?: boolean;
	onClick: () => void;
	className: string;
	children: JSX.Element[];
	hidden?: boolean;
}

export const Sidebar = ({
	className,
	open,
	onClick,
	noButton = false,
	hidden = false,
	children,
}: ISidebar): JSX.Element => (
	<Container className={`${className} ${open && 'open'}`} hidden={hidden}>
		<Button onClick={onClick} variant="main" hidden={noButton}>
			<ExpandIcon />
		</Button>
		<Content>
			{children}
		</Content>
	</Container>
);

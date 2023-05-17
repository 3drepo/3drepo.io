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

import { MenuItemProps } from '@mui/material';
import { AssigneeCircle } from '@controls/assigneesSelect/assigneeCircle/assigneeCircle.component';
import { ListItemContainer, Subtitle, Title, Checkbox } from './assigneesSelectMenuItem.styles';

type IAssigneesSelectMenuItem = MenuItemProps & {
	title: string;
	subtitle?: string;
	assignee: string;
};

export const AssigneesSelectMenuItem = ({ assignee, title, subtitle, selected, ...props }: IAssigneesSelectMenuItem) => (
	<ListItemContainer {...props}>
		<AssigneeCircle assignee={assignee} />
		<div>
			<Title>{title}</Title>
			<Subtitle>{subtitle}</Subtitle>
		</div>
		<Checkbox checked={selected} />
	</ListItemContainer>
);

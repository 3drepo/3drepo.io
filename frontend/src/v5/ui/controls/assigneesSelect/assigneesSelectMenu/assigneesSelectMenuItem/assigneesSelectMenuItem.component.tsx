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
import { ListItemContainer, Subtitle, Title, Checkbox, Titles } from './assigneesSelectMenuItem.styles';

type IAssigneesSelectMenuItem = MenuItemProps & {
	title: string;
	subtitle?: string;
	assignee: string;
	multiple: boolean;
	error?: boolean
};

export const AssigneesSelectMenuItem = ({ assignee, title, subtitle, selected, multiple, error, ...props }: IAssigneesSelectMenuItem) => (
	<ListItemContainer selected={!multiple && selected} $error={error} {...props}>
		<AssigneeCircle assignee={assignee} />
		<Titles>
			<Title>{title}</Title>
			<Subtitle>{subtitle}</Subtitle>
		</Titles>
		{ multiple && <Checkbox checked={selected} /> }
	</ListItemContainer>
);

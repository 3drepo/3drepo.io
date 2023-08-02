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

import { MenuItem } from '@mui/material';
import { Select, SelectProps } from '@controls/inputs/select/select.component';
import { IssueProperties } from '@/v5/ui/routes/viewer/tickets/tickets.constants';

export const GroupBySelect = ({ onChange, ...props }: SelectProps) => (
	<Select {...props} onChange={(e) => onChange(e.target.value)}>
		{Object.values(IssueProperties).map((val) => (<MenuItem value={val.toLocaleLowerCase()}>{val}</MenuItem>))}
	</Select>
);

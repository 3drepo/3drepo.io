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
import { TeamspacesHooksSelectors } from '@/v5/services/selectorsHooks';
import { useParams } from 'react-router-dom'; 

export const TemplateSelect = ({ onChange, ...props }: SelectProps) => {
	const { teamspace } = useParams();
	const templates = TeamspacesHooksSelectors.selectTemplatesByTeamspace(teamspace);

	return (
		<Select
			{...props}
			onChange={(e) => onChange(e.target.value)}
			label='Select Ticket type'
		>
			{templates.map(({ _id, name }) => (<MenuItem key={_id} value={_id}>{name}</MenuItem>))}
		</Select>
	);
};

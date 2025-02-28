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
import { AssigneesSelect, AssigneesSelectProps } from '@controls/assigneesSelect/assigneesSelect.component';
import { FormInputProps } from '@controls/inputs/inputController.component';
import { FormControl, FormHelperText, InputLabel } from '@mui/material';

type JobsAndUsersPropertyProps = FormInputProps & AssigneesSelectProps;
export const JobsAndUsersProperty = ({ value, ...props }: JobsAndUsersPropertyProps) => (
	<FormControl required={props.required} disabled={props.disabled} error={props.error} className={props.className}>
		<InputLabel id={`${props.name}-label`}>{props.label}</InputLabel>
		<AssigneesSelect value={value} {...props} />
		<FormHelperText>{props.helperText}</FormHelperText>
	</FormControl>
);
	
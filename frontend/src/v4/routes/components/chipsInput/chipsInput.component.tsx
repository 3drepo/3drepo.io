/**
 *  Copyright (C) 2017 3D Repo Ltd
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
import { FunctionComponent } from 'react';
import { TextField } from '@mui/material';
import { StyledChipInput } from './chipsInput.styles';

interface IProps {
	name: string;
	value: string[];
	onChange: (event) => void;
	placeholder?: string;
}

export const ChipsInput: FunctionComponent<IProps> = ({ name, onChange, placeholder, ...props }) => {
	const getValues = () => [...props.value];

	const handleChipChange = (_, value) => {
		onChange?.call(null, {
			target: {
				value,
				name,
			}
		});
	};

	return (
		<StyledChipInput
			{...props}
			multiple
			freeSolo
			options={[]}
			onChange={handleChipChange}
			defaultValue={getValues()}
			disableClearable
			renderInput={(params) => (
				<TextField
					{...params}
					placeholder={placeholder}
				/>
			)}
		/>
	);
};

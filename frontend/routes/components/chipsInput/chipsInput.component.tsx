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

import React from 'react';

import { snakeCase } from 'lodash';

import { StyledChipInput } from './chipsInput.styles';

interface IProps {
	name: string;
	value: string[];
	onChange: (event) => void;
	placeholder?: string;
}

export const ChipsInput: React.FunctionComponent<IProps> = ({ name, onChange, ...props }) => {
	const getValues = () => [...props.value];

	const handleAddChip = (value) => {
		const chipExists = !!props.value.find((chipValue) => (value === chipValue));

		if (!chipExists && onChange) {
			onChange({
				target: {
					value: [...props.value, value],
					name,
				}
			});
		}
	};

	const handleDeleteChip = (chipToRemove) => {
		const newValue = props.value.filter((chip) => chip !== chipToRemove);

		if (onChange) {
			onChange({
				target: {
					value: [...newValue],
					name,
				}
			});
		}
	};

	return (
		<StyledChipInput
			{...props}
			value={getValues()}
			InputProps={{
				name,
			}}
			onAdd={handleAddChip}
			onDelete={handleDeleteChip}
			alwaysShowPlaceholder
			fullWidth
		/>
	);
};

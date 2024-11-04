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

import { useRef } from 'react';

import { Tooltip } from '@mui/material';
import { Formik } from 'formik';

import { StyledForm, StyledTextField, TextFieldWrapper } from './sequenceForm.styles';

export const SequenceForm = ({ id, name, updateSequence }) => {
	const textFieldRef = useRef(null);

	const handleSubmit = () => textFieldRef.current.saveChange();

	const handleSave = ({ target: { value: newName }}) => updateSequence(id, newName);

	return (
		<Formik
			initialValues={{ newName: name }}
			onSubmit={handleSubmit}
		>
		<StyledForm>
			<Tooltip title={name}>
				<TextFieldWrapper>
					<StyledTextField
						ref={textFieldRef}
						requiredConfirm
						fullWidth
						value={name}
						name="newName"
						mutable
						onChange={handleSave}
						inputProps={{ maxlength: 29 }}
						disableShowDefaultUnderline
					/>
				</TextFieldWrapper>
			</Tooltip>
		</StyledForm>
	</Formik>
	);
};

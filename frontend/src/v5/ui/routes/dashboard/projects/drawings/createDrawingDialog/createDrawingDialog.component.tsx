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

import { formatMessage } from '@/v5/services/intl';
import { FormTextField, FormSelect } from '@controls/inputs/formInputs.component';
import { MenuItem } from '@mui/material';
// import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { FormModal } from '@controls/formModal/formModal.component';
import { yupResolver } from '@hookform/resolvers/yup';
import { CreateDrawingSchema } from '@/v5/validation/drawingsSchemes/drawingSchemes';

interface IFormInput {
	name: string;
	drawingNumber: string;
	category: string;
	desc: string
}


export const CreateDrawingDialog = ({ open, onClickClose }) => {
	// const [alreadyExistingNames, setAlreadyExistingNames] = useState([]);
	const {
		handleSubmit,
		// getValues,
		// trigger,
		control,
		formState,
		formState: { errors },
	} = useForm<IFormInput>({
		mode: 'onChange',
		resolver: yupResolver(CreateDrawingSchema),
		defaultValues: { name:'' },
	});
	// const teamspace = TeamspacesHooksSelectors.selectCurrentTeamspace();
	// const project = ProjectsHooksSelectors.selectCurrentProject();

	// const onSubmitError = (err) => {
	// if (nameAlreadyExists(err)) {
	// setAlreadyExistingNames([getValues('name'), ...alreadyExistingNames]);
	// trigger('name');
	// }
	// };
	const categories = ['cat 1', 'cat 2'];

	const onSubmit: SubmitHandler<IFormInput> = (body) => {
		console.log(body);
	};

	return (
		<FormModal
			open={open}
			title={formatMessage({ id: 'drawings.creation.title', defaultMessage: 'Create new Drawing' })}
			onClickClose={onClickClose}
			onSubmit={handleSubmit(onSubmit)}
			confirmLabel={formatMessage({ id: 'drawings.creation.ok', defaultMessage: 'Create Drawing' })}
			isValid={formState.isValid}
			maxWidth="sm"
		>
			<FormTextField
				control={control}
				name="name"
				label={formatMessage({ id: 'drawings.creation.form.name', defaultMessage: 'Name' })}
				formError={errors.name}
				required
			/>

			<FormTextField
				control={control}
				name="drawingNumber"
				label={formatMessage({ id: 'drawings.creation.form.drawingNumber', defaultMessage: 'Drawing Number' })}
				formError={errors.drawingNumber}
				required
			/>
			<FormSelect
				required
				control={control}
				label={formatMessage({ id: 'containers.creation.form.category', defaultMessage: 'Category' })}
				name="type"
			>
				{categories.map((category) => (
					<MenuItem key={category} value={category}> {category}</MenuItem>
				))}
			</FormSelect>
			<FormTextField
				control={control}
				name="desc"
				label={formatMessage({ id: 'drawings.creation.form.code', defaultMessage: 'Description' })}
				formError={errors.desc}
			/>
			{/* <UnhandledErrorInterceptor expectedErrorValidators={[nameAlreadyExists]} /> */}
		</FormModal>
	);

};
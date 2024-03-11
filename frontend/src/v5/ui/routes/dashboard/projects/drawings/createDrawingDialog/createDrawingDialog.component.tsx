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
import { useForm, SubmitHandler } from 'react-hook-form';
import { FormModal } from '@controls/formModal/formModal.component';
import { yupResolver } from '@hookform/resolvers/yup';
import { CreateDrawingSchema } from '@/v5/validation/drawingsSchemes/drawingSchemes';
import { DrawingHooksSelectors, ProjectsHooksSelectors, TeamspacesHooksSelectors } from '@/v5/services/selectorsHooks';
import { useEffect, useState } from 'react';
import { DrawingActionDispatchers } from '@/v5/services/actionsDispatchers';
import { nameAlreadyExists } from '@/v5/validation/errors.helpers';
import { UnhandledErrorInterceptor } from '@controls/errorMessage/unhandledErrorInterceptor/unhandledErrorInterceptor.component';
interface IFormInput {
	name: string;
	drawingNumber: string;
	category: string;
	desc: string
}


export const CreateDrawingDialog = ({ open, onClickClose }) => {
	const teamspace = TeamspacesHooksSelectors.selectCurrentTeamspace();
	const project = ProjectsHooksSelectors.selectCurrentProject();
	const categories = DrawingHooksSelectors.selectCategories();
	const isCategoriesPending = DrawingHooksSelectors.selectIsCategoriesPending();
	const drawingsNames = DrawingHooksSelectors.selectDrawings().map((d) => d.name);
	const [alreadyExistingNames, setAlreadyExistingNames] = useState(drawingsNames);
	

	const {
		handleSubmit,
		getValues,
		trigger,
		setValue,
		control,
		formState,
		formState: { errors },
	} = useForm<IFormInput>({
		mode: 'onChange',
		resolver: yupResolver(CreateDrawingSchema),
		context: { alreadyExistingNames },
	});

	const onSubmitError = (err) => {
		if (nameAlreadyExists(err)) {
			setAlreadyExistingNames([getValues('name'), ...alreadyExistingNames]);
			trigger('name');
		}
	};

	useEffect(() => {
		if (isCategoriesPending) return;
		setValue('category', categories[0]);
	}, [isCategoriesPending]);

	useEffect(() => {
		if (!isCategoriesPending) return;
		DrawingActionDispatchers.fetchCategories(teamspace, project);
	}, []);

	const onSubmit: SubmitHandler<IFormInput> = async (body) => {
		try {
			await new Promise<void>((accept, reject ) => DrawingActionDispatchers.createDrawing(teamspace, project, body as any, accept, reject));
			onClickClose();
		} catch (err) {
			onSubmitError(err);
		}
	};

	return (
		<FormModal
			open={open}
			title={formatMessage({ id: 'drawings.creation.title', defaultMessage: 'Create new Drawing' })}
			onClickClose={onClickClose}
			onSubmit={handleSubmit(onSubmit)}
			confirmLabel={formatMessage({ id: 'drawings.creation.ok', defaultMessage: 'Create Drawing' })}
			isValid={formState.isValid}
			isSubmitting={formState.isSubmitting}
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
				label={formatMessage({ id: 'drawings.creation.form.category', defaultMessage: 'Category' })}
				name="category"
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
			<UnhandledErrorInterceptor expectedErrorValidators={[nameAlreadyExists]} />
		</FormModal>
	);

};
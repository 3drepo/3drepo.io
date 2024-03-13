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
import { SubmitHandler } from 'react-hook-form';
import { FormModal } from '@controls/formModal/formModal.component';
import { DrawingHooksSelectors, ProjectsHooksSelectors, TeamspacesHooksSelectors } from '@/v5/services/selectorsHooks';
import { DrawinsgActionDispatchers } from '@/v5/services/actionsDispatchers';
import { nameAlreadyExists, numberAlreadyExists } from '@/v5/validation/errors.helpers';
import { UnhandledErrorInterceptor } from '@controls/errorMessage/unhandledErrorInterceptor/unhandledErrorInterceptor.component';
import { IFormInput, useDrawingForm } from './drawingsDialogs.hooks';

export const CreateDrawingDialog = ({ open, onClickClose }) => {
	const teamspace = TeamspacesHooksSelectors.selectCurrentTeamspace();
	const project = ProjectsHooksSelectors.selectCurrentProject();
	const categories = DrawingHooksSelectors.selectCategories();

	const { onSubmitError, formData } = useDrawingForm();

	const {
		handleSubmit,
		control,
		formState,
		formState: { errors },
	} = formData;

	const onSubmit: SubmitHandler<IFormInput> = async (body) => {
		try {
			await new Promise<void>((accept, reject ) => DrawinsgActionDispatchers.createDrawing(teamspace, project, body as any, accept, reject));
			onClickClose();
		} catch (err) {
			onSubmitError(err);
		}
	};

	return (
		<FormModal
			open={open}
			title={formatMessage({ id: 'drawings.creation.title', defaultMessage: 'Create new Drawing' })}
			onClickClose={!formState.isSubmitting ? onClickClose : null}
			onSubmit={handleSubmit(onSubmit)}
			confirmLabel={formatMessage({ id: 'drawings.creation.ok', defaultMessage: 'Create Drawing' })}
			maxWidth="sm"
			{...formState}
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
				label={formatMessage({ id: 'drawings.creation.form.description', defaultMessage: 'Description' })}
				formError={errors.desc}
			/>
			<UnhandledErrorInterceptor expectedErrorValidators={[nameAlreadyExists, numberAlreadyExists]} />
		</FormModal>
	);
};
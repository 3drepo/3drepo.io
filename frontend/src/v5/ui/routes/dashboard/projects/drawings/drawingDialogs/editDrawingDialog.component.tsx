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
import { DrawingsHooksSelectors, ProjectsHooksSelectors, TeamspacesHooksSelectors } from '@/v5/services/selectorsHooks';
import { DrawingsActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { nameAlreadyExists, numberAlreadyExists } from '@/v5/validation/errors.helpers';
import { UnhandledErrorInterceptor } from '@controls/errorMessage/unhandledErrorInterceptor/unhandledErrorInterceptor.component';
import { IFormInput, useDrawingForm } from './drawingsDialogs.hooks';
import { IDrawing } from '@/v5/store/drawings/drawings.types';
import { ShareTextField } from '@controls/shareTextField';
import { FormattedMessage } from 'react-intl';
import { SectionTitle } from '../../settingsModal/settingsModal.styles';
import { dirtyValuesChanged } from '@/v5/helpers/form.helper';

interface Props { 
	open: boolean; 
	onClickClose: () => void;
	drawing: IDrawing
}

export const EditDrawingDialog = ({ open, onClickClose, drawing }:Props) => {
	const teamspace = TeamspacesHooksSelectors.selectCurrentTeamspace();
	const project = ProjectsHooksSelectors.selectCurrentProject();
	const types = DrawingsHooksSelectors.selectTypes();
	const isProjectAdmin = ProjectsHooksSelectors.selectIsProjectAdmin();

	const { onSubmitError, formData } = useDrawingForm(drawing);

	const {
		handleSubmit,
		control,
		formState,
		formState: { errors },
	} = formData;

	const onSubmit: SubmitHandler<IFormInput> = async (body) => {
		try {
			await new Promise<void>((accept, reject ) => 
				DrawingsActionsDispatchers.updateDrawing(teamspace, project, drawing._id, body as any, accept, reject));
			onClickClose();
		} catch (err) {
			onSubmitError(err);
		}
	};

	return (
		<FormModal
			open={open}
			title={formatMessage({ id: 'drawings.edit.title', defaultMessage: 'Drawing Settings' })}
			onClickClose={!formState.isSubmitting ? onClickClose : null}
			onSubmit={handleSubmit(onSubmit)}
			confirmLabel={formatMessage({ id: 'drawings.edit.ok', defaultMessage: 'Save Drawing' })}
			maxWidth="sm"
			{...formState}
			isValid={dirtyValuesChanged(formData, drawing) && formState.isValid}
		>
			<SectionTitle>
				<FormattedMessage
					id="drawings.edit.informationTitle"
					defaultMessage="Drawing information"
				/>
			</SectionTitle>
			<ShareTextField
				label={formatMessage({ id: 'drawings.id', defaultMessage: 'ID' })}
				value={drawing._id}
			/>
			<FormTextField
				control={control}
				name="name"
				label={formatMessage({ id: 'drawings.creation.form.name', defaultMessage: 'Name' })}
				formError={errors.name}
				disabled={!isProjectAdmin}
				required
			/>

			<FormTextField
				control={control}
				name="number"
				label={formatMessage({ id: 'drawings.creation.form.number', defaultMessage: 'Drawing Number' })}
				formError={errors.number}
				disabled={!isProjectAdmin}
				required
			/>
			<FormSelect
				control={control}
				name="type"
				label={formatMessage({ id: 'drawings.creation.form.type', defaultMessage: 'Category' })}
				disabled={!isProjectAdmin}
				required
			>
				{types.map((type) => (
					<MenuItem key={type} value={type}> {type}</MenuItem>
				))}
			</FormSelect>
			<FormTextField
				control={control}
				name="desc"
				label={formatMessage({ id: 'drawings.creation.form.description', defaultMessage: 'Description' })}
				formError={errors.desc}
				disabled={!isProjectAdmin}
			/>
			<UnhandledErrorInterceptor expectedErrorValidators={[nameAlreadyExists, numberAlreadyExists]} />
		</FormModal>
	);
};
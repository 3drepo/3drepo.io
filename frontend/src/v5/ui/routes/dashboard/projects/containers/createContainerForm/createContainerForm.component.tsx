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
import { useState, type JSX } from 'react';
import { formatMessage } from '@/v5/services/intl';
import { yupResolver } from '@hookform/resolvers/yup';
import { FormModal } from '@controls/formModal/formModal.component';
import { useForm, SubmitHandler } from 'react-hook-form';
import { ContainersActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { CONTAINER_TYPES } from '@/v5/store/containers/containers.types';
import { MODEL_UNITS } from '../../models.helpers';
import { CreateContainerSchema } from '@/v5/validation/containerAndFederationSchemes/containerSchemes';
import { FormSelect, FormTextField } from '@controls/inputs/formInputs.component';
import { MenuItem } from '@mui/material';
import { nameAlreadyExists } from '@/v5/validation/errors.helpers';
import { UnhandledErrorInterceptor } from '@controls/errorMessage/unhandledErrorInterceptor/unhandledErrorInterceptor.component';
import { ProjectsHooksSelectors, TeamspacesHooksSelectors } from '@/v5/services/selectorsHooks';
import { FlexContainer } from './createContainerForm.styles';

interface ICreateContainer {
	open: boolean;
	onClickClose: () => void;
}

interface IFormInput {
	name: string;
	unit: string;
	desc: string;
	code: string;
	type: string;
}

export const CreateContainerForm = ({ open, onClickClose }: ICreateContainer): JSX.Element => {
	const [alreadyExistingNames, setAlreadyExistingNames] = useState([]);
	const {
		handleSubmit,
		getValues,
		trigger,
		control,
		formState,
		formState: { errors },
	} = useForm<IFormInput>({
		mode: 'onChange',
		resolver: yupResolver(CreateContainerSchema),
		context: { alreadyExistingNames },
		defaultValues: {
			name: '',
			unit: 'mm',
			type: 'Uncategorised',
			desc: '',
			code: '',
		},
	});
	const teamspace = TeamspacesHooksSelectors.selectCurrentTeamspace();
	const project = ProjectsHooksSelectors.selectCurrentProject();

	const onSubmitError = (err) => {
		if (nameAlreadyExists(err)) {
			setAlreadyExistingNames([getValues('name'), ...alreadyExistingNames]);
			trigger('name');
		}
	};

	const onSubmit: SubmitHandler<IFormInput> = (body) => {
		ContainersActionsDispatchers.createContainer(teamspace, project, body, onClickClose, onSubmitError);
	};

	return (
		<FormModal
			open={open}
			title={formatMessage({ id: 'containers.creation.title', defaultMessage: 'Create new Container' })}
			onClickClose={onClickClose}
			onSubmit={handleSubmit(onSubmit)}
			confirmLabel={formatMessage({ id: 'containers.creation.ok', defaultMessage: 'Create Container' })}
			isValid={formState.isValid}
			maxWidth="sm"
		>
			<FormTextField
				control={control}
				name="name"
				label={formatMessage({ id: 'containers.creation.form.name', defaultMessage: 'Name' })}
				formError={errors.name}
				required
			/>
			<FlexContainer>
				<FormSelect
					required
					control={control}
					name="unit"
					label={formatMessage({ id: 'containers.creation.form.units', defaultMessage: 'Units' })}
				>
					{MODEL_UNITS.map((unit) => (
						<MenuItem key={unit.value} value={unit.value}>
							{unit.name}
						</MenuItem>
					))}
				</FormSelect>
				<FormSelect
					required
					control={control}
					label={formatMessage({ id: 'containers.creation.form.category', defaultMessage: 'Category' })}
					name="type"
				>
					{CONTAINER_TYPES.map((unit) => (
						<MenuItem key={unit.value} value={unit.value}>
							{unit.value}
						</MenuItem>
					))}
				</FormSelect>
			</FlexContainer>
			<FormTextField
				control={control}
				name="desc"
				label={formatMessage({ id: 'containers.creation.form.description', defaultMessage: 'Description' })}
				formError={errors.desc}
			/>
			<FormTextField
				control={control}
				name="code"
				label={formatMessage({ id: 'containers.creation.form.code', defaultMessage: 'Code' })}
				formError={errors.code}
			/>
			<UnhandledErrorInterceptor expectedErrorValidators={[nameAlreadyExists]} />
		</FormModal>
	);
};

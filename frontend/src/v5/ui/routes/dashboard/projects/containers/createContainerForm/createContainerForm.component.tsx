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
import { useEffect } from 'react';
import { formatMessage } from '@/v5/services/intl';
import { yupResolver } from '@hookform/resolvers/yup';
import { FormModal } from '@controls/modal/formModal/formDialog.component';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useParams } from 'react-router';
import { ContainersActionsDispatchers } from '@/v5/services/actionsDispatchers/containersActions.dispatchers';
import { CONTAINER_TYPES, CONTAINER_UNITS } from '@/v5/store/containers/containers.types';
import { CreateContainerSchema } from '@/v5/validation/containers';
import { FormTextField } from '@controls/formTextField/formTextField.component';
import { FormSelect } from '@controls/formSelect/formSelect.component';
import { MenuItem } from '@mui/material';
import { DashboardParams } from '@/v5/ui/routes/routes.constants';
import { FlexContainer } from './createContainerForm.styles';

interface IFormInput {
	name: string;
	unit: string;
	desc: string;
	code: string;
	type: string;
}

export const CreateContainerForm = ({ open, close }): JSX.Element => {
	const { control, handleSubmit, formState, reset, formState: { errors } } = useForm<IFormInput>({
		mode: 'onChange',
		resolver: yupResolver(CreateContainerSchema),
	});
	const { teamspace, project } = useParams<DashboardParams>();
	const onSubmit: SubmitHandler<IFormInput> = (body) => {
		ContainersActionsDispatchers.createContainer(teamspace, project, body);
		close();
	};

	useEffect(() => {
		if (formState.isSubmitSuccessful) reset();
	}, [formState, reset]);

	return (
		<FormModal
			title={formatMessage({ id: 'containers.creation.title', defaultMessage: 'Create new Container' })}
			open={open}
			onClickClose={close}
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
					defaultValue="mm"
				>
					{
						CONTAINER_UNITS.map((unit) => (
							<MenuItem key={unit.value} value={unit.value}>
								{unit.name}
							</MenuItem>
						))
					}
				</FormSelect>
				<FormSelect
					required
					control={control}
					label={formatMessage({ id: 'containers.creation.form.category', defaultMessage: 'Category' })}
					defaultValue="Uncategorised"
					name="type"
				>
					{
						CONTAINER_TYPES.map((unit) => (
							<MenuItem key={unit.value} value={unit.value}>
								{unit.value}
							</MenuItem>
						))
					}
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
		</FormModal>
	);
};

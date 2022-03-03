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
import { FormattedMessage } from 'react-intl';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { MenuItem } from '@mui/material';
import { FormModal } from '@/v5/ui/controls/modal/formModal/formDialog.component';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useParams } from 'react-router';
import { ContainersActionsDispatchers } from '@/v5/services/actionsDispatchers/containersActions.dispatchers';
import { FormSelect } from '@controls/formSelect/formSelect.component';
import { FormTextField } from '@controls/formTextField/formTextField.component';
import { SelectColumn } from './createContainerForm.styles';

interface IFormInput {
	name: string;
	unit: string;
	desc: string;
	code: string;
	type: string;
}

const ContainerSchema = Yup.object().shape({
	name: Yup.string()
		.min(2,
			formatMessage({
				id: 'containers.creation.name.error.min',
				defaultMessage: 'Container Name must be at least 2 characters',
			}))
		.max(120,
			formatMessage({
				id: 'containers.creation.name.error.max',
				defaultMessage: 'Container Name is limited to 120 characters',
			}))
		.required(
			formatMessage({
				id: 'containers.creation.name.error.required',
				defaultMessage: 'Container Name is a required field',
			}),
		),
	unit: Yup.string().required().default('mm'),
	type: Yup.string().required().default('Uncategorised'),
	code: Yup.string()
		.max(50,
			formatMessage({
				id: 'containers.creation.code.error.max',
				defaultMessage: 'Code is limited to 50 characters',
			}))
		.matches(/^[A-Za-z0-9]*$/,
			formatMessage({
				id: 'containers.creation.code.error.characters',
				defaultMessage: 'Code can only consist of letters and numbers',
			})),
	desc: Yup.string()
		.max(50,
			formatMessage({
				id: 'containers.creation.desc.error.max',
				defaultMessage: 'Container Description is limited to 50 characters',
			})).default('Uncategorised'),
});

export const CreateContainerForm = ({ open, close }): JSX.Element => {
	const { handleSubmit, control, formState, reset, formState: { errors } } = useForm<IFormInput>({
		mode: 'onChange',
		resolver: yupResolver(ContainerSchema),
	});
	const { teamspace, project } = useParams() as { teamspace: string, project: string };
	const onSubmit: SubmitHandler<IFormInput> = (body) => {
		ContainersActionsDispatchers.createContainer(teamspace, project, body);
		close();
	};

	useEffect(() => { reset(); }, [!open]);

	return (
		<FormModal
			title={formatMessage({ id: 'containers.creation.title', defaultMessage: 'Create new Container' })}
			open={open}
			onClickClose={close}
			onSubmit={handleSubmit(onSubmit)}
			confirmLabel={formatMessage({ id: 'containers.creation.ok', defaultMessage: 'Create Container' })}
			isValid={formState.isValid}
		>
			<FormTextField
				name="name"
				control={control}
				label={formatMessage({ id: 'containers.creation.form.name', defaultMessage: 'Name' })}
				required
				formError={errors.name}
			/>
			<SelectColumn>
				<FormSelect
					label={formatMessage({ id: 'containers.creation.form.unit', defaultMessage: 'Units' })}
					name="unit"
					required
					defaultValue="mm"
					control={control}
				>
					<MenuItem value="mm">
						<FormattedMessage id="containers.creation.form.unit.mm" defaultMessage="Millimetres" />
					</MenuItem>
					<MenuItem value="cm">
						<FormattedMessage id="containers.creation.form.unit.cm" defaultMessage="Centimetres" />
					</MenuItem>
					<MenuItem value="dm">
						<FormattedMessage id="containers.creation.form.unit.dm" defaultMessage="Decimetres" />
					</MenuItem>
					<MenuItem value="m">
						<FormattedMessage id="containers.creation.form.unit.m" defaultMessage="Metres" />
					</MenuItem>
					<MenuItem value="ft">
						<FormattedMessage id="containers.creation.form.unit.ft" defaultMessage="Feet and inches" />
					</MenuItem>
				</FormSelect>
			</SelectColumn>

			<SelectColumn>
				<FormSelect
					label={formatMessage({ id: 'containers.creation.form.category', defaultMessage: 'Category' })}
					name="category"
					defaultValue="Uncategorised"
					control={control}
				>
					<MenuItem value="Uncategorised">
						<FormattedMessage id="containers.creation.form.type.uncategorised" defaultMessage="Uncategorised" />
					</MenuItem>
					<MenuItem value="Architectural">
						<FormattedMessage id="containers.creation.form.type.architectural" defaultMessage="Architectural" />
					</MenuItem>
					<MenuItem value="Existing">
						<FormattedMessage id="containers.creation.form.type.existing" defaultMessage="Existing" />
					</MenuItem>
					<MenuItem value="GIS">
						<FormattedMessage id="containers.creation.form.type.gis" defaultMessage="GIS" />
					</MenuItem>
					<MenuItem value="Infrastructure">
						<FormattedMessage id="containers.creation.form.type.infrastructure" defaultMessage="Infrastructure" />
					</MenuItem>
					<MenuItem value="Interior">
						<FormattedMessage id="containers.creation.form.type.interior" defaultMessage="Interior" />
					</MenuItem>
					<MenuItem value="Landscape">
						<FormattedMessage id="containers.creation.form.type.ladscape" defaultMessage="Landscape" />
					</MenuItem>
					<MenuItem value="MEP">
						<FormattedMessage id="containers.creation.form.type.mep" defaultMessage="MEP" />
					</MenuItem>
					<MenuItem value="Mechanical">
						<FormattedMessage id="containers.creation.form.type.mechanical" defaultMessage="Mechanical" />
					</MenuItem>
					<MenuItem value="Structural">
						<FormattedMessage id="containers.creation.form.type.structural" defaultMessage="Structural" />
					</MenuItem>
					<MenuItem value="Survey">
						<FormattedMessage id="containers.creation.form.type.survey" defaultMessage="Survey" />
					</MenuItem>
					<MenuItem value="Other">
						<FormattedMessage id="containers.creation.form.type.other" defaultMessage="Other" />
					</MenuItem>
				</FormSelect>
			</SelectColumn>

			<FormTextField
				name="desc"
				control={control}
				label={formatMessage({ id: 'containers.creation.form.desc', defaultMessage: 'Description' })}
				required
				formError={errors.desc}
			/>

			<FormTextField
				name="code"
				control={control}
				label={formatMessage({ id: 'containers.creation.form.code', defaultMessage: 'Code' })}
				formError={errors.code}
			/>
		</FormModal>
	);
};

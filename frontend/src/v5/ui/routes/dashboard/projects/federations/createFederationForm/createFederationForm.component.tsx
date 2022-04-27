/**
 *  Copyright (C) 2022 3D Repo Ltd
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
import { FederationCreationSchema } from '@/v5/validation/federations';
import { FormSelect } from '@controls/formSelect/formSelect.component';
import { FormTextField } from '@controls/formTextField/formTextField.component';
import { FormModal } from '@controls/modal/formModal/formDialog.component';
import { yupResolver } from '@hookform/resolvers/yup';
import { MenuItem } from '@mui/material';
import { useForm } from 'react-hook-form';
import { FormattedMessage } from 'react-intl';
import { SectionTitle } from '../federationSettingsForm/federationSettingsForm.styles';
import { HalfWidth } from './createFederationForm.styles';

const UNITS = [
	{
		name: formatMessage({ id: 'units.mm.name', defaultMessage: 'Millimetres' }),
		abbreviation: formatMessage({ id: 'units.mm.abbreviation', defaultMessage: 'mm' }),
	},
	{
		name: formatMessage({ id: 'units.cm.name', defaultMessage: 'Centimetres' }),
		abbreviation: formatMessage({ id: 'units.cm.abbreviation', defaultMessage: 'cm' }),
	},
	{
		name: formatMessage({ id: 'units.dm.name', defaultMessage: 'Decimetres' }),
		abbreviation: formatMessage({ id: 'units.dm.abbreviation', defaultMessage: 'dm' }),
	},
	{
		name: formatMessage({ id: 'units.m.name', defaultMessage: 'Metres' }),
		abbreviation: formatMessage({ id: 'units.m.abbreviation', defaultMessage: 'm' }),
	},
	{
		name: formatMessage({ id: 'units.ft.name', defaultMessage: 'Feet and inches' }),
		abbreviation: formatMessage({ id: 'units.ft.abbreviation', defaultMessage: 'ft' }),
	},
];
interface ICreateFederation {
	open: boolean;
	onClickClose: () => void;
}

interface IFormInput {
	name: string;
	description: string;
	code: string;
	unit: string;
}

export const CreateFederationForm = ({ open, onClickClose }: ICreateFederation) => {
	const {
		control,
		formState: { errors },
	} = useForm<IFormInput>({
		mode: 'onChange',
		resolver: yupResolver(FederationCreationSchema),
	});
	return (
		<FormModal
			title={formatMessage({ id: 'federations.creation.title', defaultMessage: 'Create new Federation' })}
			open={open}
			onClickClose={onClickClose}
		>
			<SectionTitle>
				<FormattedMessage
					id="federations.creation.form.informationTitle"
					defaultMessage="Federation information"
				/>
			</SectionTitle>

			<FormTextField
				name="name"
				control={control}
				label={formatMessage({ id: 'federations.creation.form.name', defaultMessage: 'Name' })}
				required
				formError={errors.name}
			/>
			<FormTextField
				name="description"
				control={control}
				label={formatMessage({ id: 'federations.settings.form.description', defaultMessage: 'Description' })}
				required
				formError={errors.description}
			/>
			<HalfWidth>
				<FormSelect
					required
					name="unit"
					label={formatMessage({
						id: 'federations.creation.form.unit',
						defaultMessage: 'Units',
					})}
					control={control}
					defaultValue="mm"
				>
					{UNITS.map(({ name, abbreviation }) => (
						<MenuItem key={abbreviation} value={abbreviation}>
							{name}
						</MenuItem>
					))}
				</FormSelect>
			</HalfWidth>
			<FormTextField
				name="code"
				control={control}
				label={formatMessage({ id: 'federations.creation.form.code', defaultMessage: 'Code' })}
				required
				formError={errors.code}
			/>
		</FormModal>
	);
};

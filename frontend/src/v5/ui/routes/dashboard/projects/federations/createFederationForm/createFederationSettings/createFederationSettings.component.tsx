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
import { MODEL_UNITS } from '../../../models.helpers';
import { FormSelect, FormTextField } from '@controls/inputs/formInputs.component';
import { MenuItem } from '@mui/material';
import { useFormContext } from 'react-hook-form';
import { FormattedMessage } from 'react-intl';
import { SectionTitle } from '../../../settingsModal/settingsModal.styles';
import { HalfWidth } from './createFederationSettings.styles';

export const CreateFederationFormSettings = () => {
	const { control, formState: { errors } } = useFormContext();
	return (
		<>
			<SectionTitle>
				<FormattedMessage
					id="createFederation.form.informationTitle"
					defaultMessage="Federation information"
				/>
			</SectionTitle>
			<FormTextField
				name="name"
				control={control}
				label={formatMessage({ id: 'createFederation.form.name', defaultMessage: 'Name' })}
				required
				formError={errors.name}
			/>
			<FormTextField
				name="desc"
				control={control}
				label={formatMessage({ id: 'createFederation.form.desc', defaultMessage: 'Description' })}
				formError={errors.desc}
			/>
			<HalfWidth>
				<FormSelect
					required
					name="unit"
					label={formatMessage({
						id: 'createFederation.form.unit',
						defaultMessage: 'Units',
					})}
					control={control}
				>
					{MODEL_UNITS.map(({ name, value }) => (
						<MenuItem key={value} value={value}>
							{name}
						</MenuItem>
					))}
				</FormSelect>
			</HalfWidth>
			<FormTextField
				name="code"
				control={control}
				label={formatMessage({ id: 'createFederation.form.code', defaultMessage: 'Code' })}
				formError={errors.code}
			/>
		</>
	);
};

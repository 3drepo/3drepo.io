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
import { FormattedMessage } from 'react-intl';
import { clientConfigService } from '@/v4/services/clientConfig';
import { MenuItem } from '@mui/material';
import { FormSelect, FormTextField } from '@controls/inputs/formInputs.component';
import { useFormContext } from 'react-hook-form';
import { NextStepButton } from '../userSignupFormNextButton/userSignupFormNextButton.component';

export interface IPersonalFormInput {
	firstName: string;
	lastName: string;
	company: string;
	countryCode: string;
}

export const UserSignupFormStepPersonal = () => {
	const {
		control,
		formState: { errors },
	} = useFormContext<IPersonalFormInput>();

	return (
		<>
			<FormTextField
				name="firstName"
				control={control}
				label={formatMessage({
					id: 'userSignup.form.firstName',
					defaultMessage: 'First name',
				})}
				required
				formError={errors.firstName}
			/>
			<FormTextField
				name="lastName"
				control={control}
				label={formatMessage({
					id: 'userSignup.form.lastName',
					defaultMessage: 'Last name',
				})}
				required
				formError={errors.lastName}
			/>
			<FormTextField
				name="company"
				control={control}
				label={formatMessage({
					id: 'userSignup.form.company',
					defaultMessage: 'Company',
				})}
				formError={errors.company}
			/>
			<FormSelect
				name="countryCode"
				control={control}
				label={formatMessage({
					id: 'userSignup.form.countryCode',
					defaultMessage: 'Country',
				})}
				required
			>
				{clientConfigService.countries.map((country) => (
					<MenuItem key={country.code} value={country.code}>
						{country.name}
					</MenuItem>
				))}
			</FormSelect>
			<NextStepButton>
				<FormattedMessage
					id="userSignup.form.button.next"
					defaultMessage="Next step"
				/>
			</NextStepButton>
		</>
	);
};

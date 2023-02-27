/**
 *  Copyright (C) 2023 3D Repo Ltd
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
import { clientConfigService } from '@/v4/services/clientConfig';
import { formatMessage } from '@/v5/services/intl';
import UserIcon from '@assets/icons/outlined/user-outlined.svg';
import { FormSelect, FormTextField } from '@controls/inputs/formInputs.component';
import MenuItem from '@mui/material/MenuItem/MenuItem';
import { useFormContext } from 'react-hook-form';
import { FormattedMessage } from 'react-intl';
import { IconContainer } from '../userSignupForm/userSignupFormStep/userSignupFormStepAccount/userSignupFormStepAccount.styles';
import { NextStepButton } from '../userSignupForm/userSignupFormStep/userSignupFormNextButton/userSignupFormNextButton.component';

export const MinUserSignupFormStepAccount = () => {
	const { control, formState: { errors } } = useFormContext();

	return (
		<>
			<FormTextField
				InputProps={{
					startAdornment: (
						<IconContainer>
							<UserIcon />
						</IconContainer>
					),
				}}
				name="username"
				label={formatMessage({
					id: 'userSignup.form.username',
					defaultMessage: 'Username',
				})}
				control={control}
				required
				formError={errors.username}
			/>

			<FormTextField
				name="company"
				label={formatMessage({
					id: 'userSignup.form.company',
					defaultMessage: 'Company',
				})}
				control={control}
				formError={errors.company}
			/>
			<FormSelect
				name="countryCode"
				label={formatMessage({
					id: 'userSignup.form.countryCode',
					defaultMessage: 'Country',
				})}
				control={control}
				required
			>
				{clientConfigService.countries.map((country) => (
					<MenuItem key={country.code} value={country.code}>
						{country.name}
					</MenuItem>
				))}
			</FormSelect>

			<NextStepButton>
				<FormattedMessage id="userSignup.form.button.next" defaultMessage="Next step" />
			</NextStepButton>
		</>
	);
};

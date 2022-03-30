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
import { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { FormTextField } from '@controls/formTextField/formTextField.component';
import { UserSignupSchemaPersonal } from '@/v5/validation/schemes';
import { FormSelect } from '@controls/formSelect/formSelect.component';
import { clientConfigService } from '@/v4/services/clientConfig';
import { MenuItem } from '@mui/material';
import { NextStepButton } from '../userSignupFormStep.styles';

interface IPersonalFormInput {
	firstname: string;
	lastname: string;
	company: string;
	country: string;
}

type UserSignupFormStepPersonalProps = {
	updateFields: (fields: any) => void;
	onSubmitStep: () => void;
	onComplete: () => void;
	onUncomplete: () => void;
	fields: IPersonalFormInput;
};

export const UserSignupFormStepPersonal = ({
	updateFields,
	onSubmitStep,
	onComplete,
	onUncomplete,
	fields,
}: UserSignupFormStepPersonalProps) => {
	const getDefaultValues = (): IPersonalFormInput => ({
		firstname: fields.firstname || '',
		lastname: fields.lastname || '',
		company: fields.company || '',
		country: fields.country || formatMessage({
			id: 'userSignup.form.defaultCountryCode',
			defaultMessage: 'GB',
		}),
	});
	const {
		getValues,
		control,
		formState,
		formState: { errors },
	} = useForm<IPersonalFormInput>({
		mode: 'onChange',
		resolver: yupResolver(UserSignupSchemaPersonal),
		defaultValues: getDefaultValues(),
	});

	const [formIsValid, setFormIsValid] = useState(formState.isValid);
	useEffect(() => {
		if (formState.isValid !== formIsValid) {
			setFormIsValid(formState.isValid);
			(formState.isValid ? onComplete : onUncomplete)();
		}
	}, [formState]);

	useEffect(() => () => {
		updateFields(getValues());
	}, []);

	return (
		<>
			<FormTextField
				name="firstname"
				control={control}
				label={formatMessage({
					id: 'userSignup.form.firstname',
					defaultMessage: 'Firstname',
				})}
				required
				formError={errors.firstname}
			/>
			<FormTextField
				name="lastname"
				control={control}
				label={formatMessage({
					id: 'userSignup.form.lastname',
					defaultMessage: 'Lastname',
				})}
				required
				formError={errors.lastname}
			/>
			<FormTextField
				name="company"
				control={control}
				label={formatMessage({
					id: 'userSignup.form.company',
					defaultMessage: 'Company',
				})}
				required
				formError={errors.company}
			/>
			<FormSelect
				name="country"
				control={control}
				label={formatMessage({
					id: 'userSignup.form.country',
					defaultMessage: 'Country',
				})}
				required
				defaultValue={getDefaultValues().country}
			>
				{clientConfigService.countries.map((country) => (
					<MenuItem key={country.code} value={country.code}>
						{country.name}
					</MenuItem>
				))}
			</FormSelect>
			<NextStepButton
				disabled={!formState.isValid}
				onClick={onSubmitStep}
			>
				<FormattedMessage
					id="userSignup.form.button.next"
					defaultMessage="Next step"
				/>
			</NextStepButton>
		</>
	);
};

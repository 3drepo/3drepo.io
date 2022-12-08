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
import { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { TextField } from '@controls/inputs/textField/textField.component';
import { UserSignupSchemaPersonal } from '@/v5/validation/userSchemes/userSignupSchemes';
import { Select } from '@controls/inputs/select/select.component';
import { clientConfigService } from '@/v4/services/clientConfig';
import { MenuItem } from '@mui/material';
import { InputController } from '@controls/inputs/inputController.component';
import { defaults, isEqual, pick } from 'lodash';
import { NextStepButton } from '../userSignupFormStep.styles';

export interface IPersonalFormInput {
	firstName: string;
	lastName: string;
	company: string;
	countryCode: string;
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
	const DEFAULT_FIELDS: IPersonalFormInput = {
		firstName: '',
		lastName: '',
		company: '',
		countryCode: 'GB',
	};
	const getPersonalFields = (): IPersonalFormInput => defaults(
		pick(fields, ['firstName', 'lastName', 'company', 'countryCode']),
		DEFAULT_FIELDS,
	);

	const {
		getValues,
		control,
		formState,
		formState: { errors, isValid: formIsValid },
	} = useForm<IPersonalFormInput>({
		mode: 'onChange',
		resolver: yupResolver(UserSignupSchemaPersonal),
		defaultValues: getPersonalFields(),
	});

	useEffect(() => (formIsValid ? onComplete : onUncomplete)(), [formIsValid]);

	useEffect(() => {
		const newFields = getValues();
		if (!isEqual(newFields, getPersonalFields())) {
			updateFields(newFields);
		}
	}, [formState]);

	return (
		<>
			<InputController
				Input={TextField}
				name="firstName"
				control={control}
				label={formatMessage({
					id: 'userSignup.form.firstName',
					defaultMessage: 'First name',
				})}
				required
				formError={errors.firstName}
			/>
			<InputController
				Input={TextField}
				name="lastName"
				control={control}
				label={formatMessage({
					id: 'userSignup.form.lastName',
					defaultMessage: 'Last name',
				})}
				required
				formError={errors.lastName}
			/>
			<InputController
				Input={TextField}
				name="company"
				control={control}
				label={formatMessage({
					id: 'userSignup.form.company',
					defaultMessage: 'Company',
				})}
				formError={errors.company}
			/>
			<InputController
				name="countryCode"
				Input={Select}
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
			</InputController>
			<NextStepButton
				disabled={!formIsValid}
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

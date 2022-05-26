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

import { EditProfileUpdatePasswordSchema } from '@/v5/validation/schemes';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { CurrentUserActionsDispatchers } from '@/v5/services/actionsDispatchers/currentUsersActions.dispatchers';
import { FormTextField } from '@controls/formTextField/formTextField.component';
import { useEffect, useState } from 'react';
import { formatMessage } from '@/v5/services/intl';
import { isEqual, omit } from 'lodash';
import { FormattedMessage } from 'react-intl';
import { SuccessMessage } from '@controls/successMessage/successMessage.component';

export interface IUpdatePasswordInputs {
	oldPassword: string;
	newPassword: string;
	confirmPassword: string;
}

type EditProfilePasswordTabProps = {
	fields: IUpdatePasswordInputs;
	setSubmitFunction: (fn: Function) => void;
	updatePasswordFields: (values: Partial<IUpdatePasswordInputs>) => void;
};

export const EditProfilePasswordTab = ({
	fields,
	setSubmitFunction,
	updatePasswordFields,
}: EditProfilePasswordTabProps) => {
	const [passwordWasIncorrect, setPasswordWasIncorrect] = useState(false);
	const [submitWasSuccessful, setSubmitWasSuccesful] = useState(false);
	const {
		formState: { errors, isValid: formIsValid },
		control,
		trigger,
		reset,
		watch,
		getValues,
		handleSubmit,
	} = useForm<IUpdatePasswordInputs>({
		mode: 'onChange',
		resolver: yupResolver(EditProfileUpdatePasswordSchema),
		context: { passwordWasIncorrect },
		defaultValues: fields,
	});

	const oldPassword = watch('oldPassword');

	const onSubmit = () => {
		try {
			const userData = omit(getValues(), ['confirmPassword']);
			CurrentUserActionsDispatchers.updateUser(userData);
			setSubmitWasSuccesful(true);
		} catch (error) {
			setPasswordWasIncorrect(true);
			// TODO handle error
		}
		reset();
	};

	useEffect(() => {
		if (passwordWasIncorrect) {
			trigger('oldPassword');
			if (oldPassword) {
				setPasswordWasIncorrect(false);
			}
		}
	}, [oldPassword]);

	useEffect(() => {
		setSubmitFunction(formIsValid ? handleSubmit(onSubmit) : null);
	}, [formIsValid]);

	useEffect(() => () => {
		const newFields = getValues();
		if (!isEqual(newFields, fields)) {
			updatePasswordFields(newFields);
		}
	}, []);

	return (
		<>
			<FormTextField
				control={control}
				name="oldPassword"
				label={formatMessage({
					id: 'editProfile.updatePassword.oldPassword',
					defaultMessage: 'Current Password',
				})}
				type="password"
				formError={errors.oldPassword}
				required
			/>
			<FormTextField
				control={control}
				name="newPassword"
				label={formatMessage({
					id: 'editProfile.updatePassword.newPassword',
					defaultMessage: 'New Password',
				})}
				type="password"
				formError={errors.newPassword}
				required
			/>
			<FormTextField
				control={control}
				name="confirmPassword"
				label={formatMessage({
					id: 'editProfile.updatePassword.confirmPassword',
					defaultMessage: 'Confirm Password',
				})}
				type="password"
				formError={errors.confirmPassword}
				required
			/>
			{submitWasSuccessful && (
				<SuccessMessage>
					<FormattedMessage id="editProfile.updatePassword.success" defaultMessage="Your password has been changed successfully." />
				</SuccessMessage>
			)}
		</>
	);
};

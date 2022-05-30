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
import { FormattedMessage } from 'react-intl';
import { SuccessMessage } from '@controls/successMessage/successMessage.component';
import { CurrentUserHooksSelectors } from '@/v5/services/selectorsHooks/currentUserSelectors.hooks';

export interface IUpdatePasswordInputs {
	oldPassword: string;
	newPassword: string;
	confirmPassword: string;
}

export const EMPTY_PASSWORDS = {
	oldPassword: '',
	newPassword: '',
	confirmPassword: '',
};

type EditProfilePasswordTabProps = {
	fields: IUpdatePasswordInputs;
	setIsSubmitting: (isSubmitting: boolean) => void;
	setSubmitFunction: (fn: Function) => void;
	updatePasswordFields: (values: Partial<IUpdatePasswordInputs>) => void;
};

export const EditProfilePasswordTab = ({
	fields,
	setIsSubmitting,
	setSubmitFunction,
	updatePasswordFields,
}: EditProfilePasswordTabProps) => {
	const passwordError = CurrentUserHooksSelectors.selectPasswordError();
	const formIsUploading = CurrentUserHooksSelectors.selectPasswordIsUpdating();

	const [formSubmittedSuccessfully, setFormSubmittedSuccessfully] = useState(false);

	const {
		formState: { errors, isValid: formIsValid, isSubmitted, isSubmitSuccessful },
		control,
		trigger,
		reset,
		watch,
		getValues,
		handleSubmit,
	} = useForm<IUpdatePasswordInputs>({
		mode: 'onChange',
		resolver: yupResolver(EditProfileUpdatePasswordSchema),
		context: { passwordError },
		defaultValues: fields,
	});

	setIsSubmitting(formIsUploading);

	const onSubmit = () => {
		setFormSubmittedSuccessfully(false);
		const passwordData = { oldPassword, newPassword };
		CurrentUserActionsDispatchers.updatePassword(passwordData);
	};

	const uploadWasSuccessful = !formIsUploading && !passwordError;

	const oldPassword = watch('oldPassword');
	const newPassword = watch('newPassword');

	useEffect(() => {
		if (passwordError) {
			trigger('oldPassword');
		} else if(formSubmittedSuccessfully) {
			setFormSubmittedSuccessfully(true);
		}
	}, [passwordError]);

	// re-trigger validation on confirmPassword when newPassword changes
	useEffect(() => {
		if (newPassword && !errors.newPassword) {
			trigger('confirmPassword');
		}
	}, [newPassword]);

	// re-trigger validation on newPassword when oldPassword changes
	useEffect(() => {
		if (oldPassword && oldPassword === newPassword && !errors.oldPassword) {
			trigger('newPassword');
		}
	}, [oldPassword]);

	useEffect(() => {
		setSubmitFunction(formIsValid ? handleSubmit(onSubmit) : null);
	}, [formIsValid]);

	useEffect(() => {
		if (isSubmitSuccessful && uploadWasSuccessful) {
			reset(EMPTY_PASSWORDS, { keepIsSubmitted: true });
		}
	}, [formIsUploading]);

	// save fields on tab change
	useEffect(() => () => {
		updatePasswordFields(getValues());
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
			{isSubmitted && uploadWasSuccessful && (
				<SuccessMessage>
					<FormattedMessage id="editProfile.updatePassword.success" defaultMessage="Your password has been changed successfully." />
				</SuccessMessage>
			)}
		</>
	);
};

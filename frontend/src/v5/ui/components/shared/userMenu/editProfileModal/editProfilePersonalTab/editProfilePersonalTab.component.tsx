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
import { CurrentUserActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { CurrentUserHooksSelectors } from '@/v5/services/selectorsHooks';
import { formatMessage } from '@/v5/services/intl';
import { clientConfigService } from '@/v4/services/clientConfig';
import { SuccessMessage } from '@controls/successMessage/successMessage.component';
import { MenuItem } from '@mui/material';
import { useFormContext } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { pickBy, isEmpty, isMatch, mapValues } from 'lodash';
import { UnhandledError } from '@controls/errorMessage/unhandledError/unhandledError.component';
import { FormSelect, FormTextField } from '@controls/inputs/formInputs.component';
import { isFileFormatUnsupported } from '@/v5/validation/errors.helpers';
import { FormModalActions } from '@controls/formModal/modalButtons/modalButtons.styles';
import { ModalCancelButton, ModalSubmitButton } from '@controls/formModal/modalButtons/modalButtons.component';
import { EditProfileAvatar } from './editProfileAvatar/editProfileAvatar.component';
import { TabContent } from '../editProfileModal.styles';

export type IUpdatePersonalInputs = Partial<{
	firstName: string;
	lastName: string;
	email: string;
	company: string;
	countryCode: string;
	avatarFile: File;
}>;

type EditProfilePersonalTabProps = {
	unexpectedError: any,
	onClickClose: () => void,
};

export const EditProfilePersonalTab = ({
	unexpectedError,
	onClickClose,
}: EditProfilePersonalTabProps) => {
	const user = CurrentUserHooksSelectors.selectCurrentUser();
	const [submitWasSuccessful, setSubmitWasSuccessful] = useState(false);
	const {
		getValues,
		handleSubmit,
		reset,
		setError: setFormError,
		control,
		formState: { errors: formErrors, isDirty, touchedFields, isSubmitting },
	} = useFormContext();

	const getSubmittableValues = (): IUpdatePersonalInputs => {
		const values = getValues();
		const trimmedValues = mapValues(values, (value) => value?.trim?.() ?? value);
		return pickBy(trimmedValues) as IUpdatePersonalInputs;
	};

	const onSubmissionSuccess = (resolve) => {
		const { avatarFile, ...values } = getSubmittableValues();
		reset(values);
		setSubmitWasSuccessful(true);
		resolve();
	};

	const onSubmissionError = (apiError, reject) => {
		setSubmitWasSuccessful(false);
		if (isFileFormatUnsupported(apiError)) {
			setFormError('avatarFile', {
				type: 'custom',
				message: formatMessage({
					id: 'editProfile.avatar.error.format',
					defaultMessage: 'The file format is not supported',
				}),
			});
		}
		reject();
	};

	const onSubmit = async () => {
		let values = getSubmittableValues();
		await new Promise((resolve, reject) => {
			CurrentUserActionsDispatchers.updatePersonalData(
				values,
				() => onSubmissionSuccess(resolve),
				(apiError) => onSubmissionError(apiError, reject),
			);
		});
	};

	const fieldsAreDirty = !isMatch(user, getSubmittableValues());
	const canSubmit = isEmpty(formErrors) && fieldsAreDirty;

	useEffect(() => {
		if (submitWasSuccessful) {
			setSubmitWasSuccessful(false);
		}
	}, [JSON.stringify(isDirty), touchedFields]);

	return (
		<>
			<TabContent>
				<EditProfileAvatar user={user} />
				{submitWasSuccessful && (
					<SuccessMessage>
						<FormattedMessage
							id="editProfile.form.updateProfileSuccess"
							defaultMessage="Your profile has been changed successfully."
						/>
					</SuccessMessage>
				)}
				<UnhandledError
					error={unexpectedError}
					expectedErrorValidators={[isFileFormatUnsupported]}
				/>
				<FormTextField
					name="firstName"
					control={control}
					label={formatMessage({
						id: 'editProfile.form.firstName',
						defaultMessage: 'First Name',
					})}
					required
					formError={formErrors.firstName}
					disabled
				/>
				<FormTextField
					name="lastName"
					control={control}
					label={formatMessage({
						id: 'editProfile.form.lastName',
						defaultMessage: 'Last Name',
					})}
					required
					formError={formErrors.lastName}
					disabled
				/>
				<FormTextField
					name="email"
					control={control}
					label={formatMessage({
						id: 'editProfile.form.email',
						defaultMessage: 'Email',
					})}
					required
					formError={formErrors.email}
					disabled
				/>
				<FormTextField
					name="company"
					control={control}
					label={formatMessage({
						id: 'editProfile.form.company',
						defaultMessage: 'Company',
					})}
					formError={formErrors.company}
				/>
				<FormSelect
					name="countryCode"
					control={control}
					label={formatMessage({
						id: 'editProfile.form.countryCode',
						defaultMessage: 'Country',
					})}
				>
					{clientConfigService.countries.map((country) => (
						<MenuItem key={country.code} value={country.code}>
							{country.name}
						</MenuItem>
					))}
				</FormSelect>
			</TabContent>
			<FormModalActions>
				<ModalCancelButton onClick={onClickClose} />
				<ModalSubmitButton disabled={!canSubmit} onClick={handleSubmit(onSubmit)} isPending={isSubmitting}>
					<FormattedMessage
						defaultMessage="Update profile"
						id="editProfile.tab.confirmButton.updateProfile"
					/>
				</ModalSubmitButton>
			</FormModalActions>
		</>
	);
};

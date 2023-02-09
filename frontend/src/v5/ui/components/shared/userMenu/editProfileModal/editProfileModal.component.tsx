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
import { useEffect, useState } from 'react';
import { formatMessage } from '@/v5/services/intl';
import { ICurrentUser } from '@/v5/store/currentUser/currentUser.types';
import { defaults, isNull, omitBy, pick } from 'lodash';
import { TabContext } from '@mui/lab';
import { FormProvider, useForm } from 'react-hook-form';
import { useErrorInterceptor } from '@controls/errorMessage/useErrorInterceptor';
import { yupResolver } from '@hookform/resolvers/yup';
import { EditProfileUpdatePasswordSchema, EditProfileUpdatePersonalSchema } from '@/v5/validation/userSchemes/editProfileSchemes';
import { FormModal, TabList, Tab, TabPanel, TruncatableName } from './editProfileModal.styles';
import { EditProfilePersonalTab, IUpdatePersonalInputs } from './editProfilePersonalTab/editProfilePersonalTab.component';
import { EditProfilePasswordTab, EMPTY_PASSWORDS, IUpdatePasswordInputs } from './editProfilePasswordTab/editProfilePasswordTab.component';
import { EditProfileIntegrationsTab } from './editProfileIntegrationsTab/editProfileIntegrationsTab.component';

const PERSONAL_TAB = 'personal';
const PASSWORD_TAB = 'password';
const INTEGRATIONS_TAB = 'integrations';

const CONFIRM_LABELS = {
	personal: formatMessage({ defaultMessage: 'Update profile', id: 'editProfile.tab.confirmButton.updateProfile' }),
	password: formatMessage({ defaultMessage: 'Update password', id: 'editProfile.tab.confirmButton.updatePassword' }),
};

const TAB_LABELS = {
	personal: formatMessage({ defaultMessage: 'Personal', id: 'editProfile.tab.title.personal' }),
	password: formatMessage({ defaultMessage: 'Password', id: 'editProfile.tab.title.password' }),
	integrations: formatMessage({ defaultMessage: 'Integrations', id: 'editProfile.tab.title.integrations' }),
};

type EditProfileModalProps = {
	user: ICurrentUser;
	onClose: () => void;
};

type EditProfileUnexpectedErrors = {
	[PERSONAL_TAB]?: any;
	[PASSWORD_TAB]?: any;
	[INTEGRATIONS_TAB]?: any;
};

export const EditProfileModal = ({ user, onClose }: EditProfileModalProps) => {
	const [activeTab, setActiveTab] = useState(PERSONAL_TAB);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [personalSubmitFunction, setPersonalSubmitFunction] = useState(null);
	const [passwordSubmitFunction, setPasswordSubmitFunction] = useState(null);
	const [incorrectPassword, setIncorrectPassword] = useState(false);
	const [alreadyExistingEmails, setAlreadyExistingEmails] = useState([]);
	const [unexpectedErrors, setUnexpectedErrors] = useState<EditProfileUnexpectedErrors>({});
	const interceptedError = useErrorInterceptor();

	const defaultPersonalValues = defaults(
		pick(omitBy(user, isNull), ['firstName', 'lastName', 'email', 'company', 'countryCode']),
		{ company: '', countryCode: 'GB', avatarFile: '' },
	);

	const getTabSubmitFunction = () => {
		switch (activeTab) {
			case PERSONAL_TAB: return personalSubmitFunction;
			case PASSWORD_TAB: return passwordSubmitFunction;
			default: return null;
		}
	};

	const onTabChange = (_, selectedTab) => setActiveTab(selectedTab);

	const personalFormData = useForm<IUpdatePersonalInputs>({
		mode: 'all',
		resolver: yupResolver(EditProfileUpdatePersonalSchema),
		context: { alreadyExistingEmails },
		defaultValues: defaultPersonalValues,
	});

	const passwordFormData = useForm<IUpdatePasswordInputs>({
		mode: 'all',
		resolver: yupResolver(EditProfileUpdatePasswordSchema(incorrectPassword)),
		defaultValues: EMPTY_PASSWORDS,
	});

	useEffect(() => {
		setUnexpectedErrors({ ...unexpectedErrors, [activeTab]: interceptedError });
	}, [interceptedError]);

	return (
		<FormModal
			open
			title={formatMessage(
				{ id: 'editProfile.title', defaultMessage: '{firstName}\'s profile' },
				{ firstName: <TruncatableName>{user.firstName}</TruncatableName> },
			)}
			onClickClose={onClose}
			confirmLabel={CONFIRM_LABELS[activeTab]}
			onSubmit={getTabSubmitFunction()}
			isValid={getTabSubmitFunction()}
			isSubmitting={isSubmitting}
			disableClosing={isSubmitting}
			hideSubmitButton={activeTab === INTEGRATIONS_TAB}
		>
			<TabContext value={activeTab}>
				<TabList onChange={onTabChange} textColor="primary" indicatorColor="primary">
					<Tab value={PERSONAL_TAB} label={TAB_LABELS.personal} disabled={isSubmitting} />
					<Tab value={PASSWORD_TAB} label={TAB_LABELS.password} disabled={isSubmitting} />
					<Tab value={INTEGRATIONS_TAB} label={TAB_LABELS.integrations} disabled={isSubmitting} />
				</TabList>
				<FormProvider {...personalFormData}>
					<TabPanel value={PERSONAL_TAB} $personalTab>
						<EditProfilePersonalTab
							alreadyExistingEmails={alreadyExistingEmails}
							setAlreadyExistingEmails={setAlreadyExistingEmails}
							setIsSubmitting={setIsSubmitting}
							setSubmitFunction={setPersonalSubmitFunction}
							unexpectedError={unexpectedErrors[PERSONAL_TAB]}
							user={user}
						/>
					</TabPanel>
				</FormProvider>
				<FormProvider {...passwordFormData}>
					<TabPanel value={PASSWORD_TAB}>
						<EditProfilePasswordTab
							incorrectPassword={incorrectPassword}
							setIncorrectPassword={setIncorrectPassword}
							setIsSubmitting={setIsSubmitting}
							setSubmitFunction={setPasswordSubmitFunction}
							unexpectedError={unexpectedErrors[PASSWORD_TAB]}
						/>
					</TabPanel>
				</FormProvider>
				<TabPanel value={INTEGRATIONS_TAB}>
					<EditProfileIntegrationsTab
						unexpectedError={unexpectedErrors[INTEGRATIONS_TAB]}
					/>
				</TabPanel>
			</TabContext>
		</FormModal>
	);
};

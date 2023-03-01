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
import { ModalCancelButton, ModalSubmitButton } from '@controls/formModal/modalButtons/modalButtons.component';
import { FormModalActions } from '@controls/formModal/modalButtons/modalButtons.styles';
import { FormModal, TabList, Tab, TabPanel, TruncatableName } from './editProfileModal.styles';
import { EditProfilePersonalTab, IUpdatePersonalInputs } from './editProfilePersonalTab/editProfilePersonalTab.component';
import { EditProfileAuthenticationTab, EMPTY_PASSWORDS, IUpdatePasswordInputs } from './editProfileAuthenticationTab/editProfileAuthenticationTab.component';
import { EditProfileIntegrationsTab } from './editProfileIntegrationsTab/editProfileIntegrationsTab.component';

const PERSONAL_TAB = 'personal';
const AUTHENTICATION_TAB = 'authentication';
const INTEGRATIONS_TAB = 'integrations';

const CONFIRM_LABELS = {
	personal: formatMessage({ defaultMessage: 'Update profile', id: 'editProfile.tab.confirmButton.updateProfile' }),
	authentication: formatMessage({ defaultMessage: 'Update password', id: 'editProfile.tab.confirmButton.updatePassword' }),
};

const TAB_LABELS = {
	personal: formatMessage({ defaultMessage: 'Personal', id: 'editProfile.tab.title.personal' }),
	authentication: formatMessage({ defaultMessage: 'Authentication', id: 'editProfile.tab.title.authentication' }),
	integrations: formatMessage({ defaultMessage: 'Integrations', id: 'editProfile.tab.title.integrations' }),
};

type EditProfileModalProps = {
	user: ICurrentUser;
	open: boolean;
	onClickClose: () => void;
};

type EditProfileUnexpectedErrors = {
	[PERSONAL_TAB]?: any;
	[AUTHENTICATION_TAB]?: any;
	[INTEGRATIONS_TAB]?: any;
};

export const EditProfileModal = ({ user, open, onClickClose }: EditProfileModalProps) => {
	const [activeTab, setActiveTab] = useState(PERSONAL_TAB);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [personalSubmitFunction, setPersonalSubmitFunction] = useState(null);
	const [authenticationSubmitFunction, setAuthenticationSubmitFunction] = useState(null);
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
			case AUTHENTICATION_TAB: return authenticationSubmitFunction;
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

	const authenticationFormData = useForm<IUpdatePasswordInputs>({
		mode: 'all',
		resolver: yupResolver(EditProfileUpdatePasswordSchema(incorrectPassword)),
		defaultValues: EMPTY_PASSWORDS,
	});

	useEffect(() => {
		setUnexpectedErrors({ ...unexpectedErrors, [activeTab]: interceptedError });
	}, [interceptedError]);

	return (
		<FormModal
			open={open}
			title={formatMessage(
				{ id: 'editProfile.title', defaultMessage: '{firstName}\'s profile' },
				{ firstName: <TruncatableName>{user.firstName}</TruncatableName> },
			)}
			onClickClose={onClickClose}
			disableClosing={isSubmitting}
		>
			<TabContext value={activeTab}>
				<TabList onChange={onTabChange} textColor="primary" indicatorColor="primary">
					<Tab value={PERSONAL_TAB} label={TAB_LABELS.personal} disabled={isSubmitting} />
					<Tab value={AUTHENTICATION_TAB} label={TAB_LABELS.authentication} disabled={isSubmitting} />
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
				<FormProvider {...authenticationFormData}>
					<TabPanel value={AUTHENTICATION_TAB}>
						<EditProfileAuthenticationTab
							incorrectPassword={incorrectPassword}
							setIncorrectPassword={setIncorrectPassword}
							setIsSubmitting={setIsSubmitting}
							setSubmitFunction={setAuthenticationSubmitFunction}
							unexpectedError={unexpectedErrors[AUTHENTICATION_TAB]}
						/>
					</TabPanel>
				</FormProvider>
				<TabPanel value={INTEGRATIONS_TAB}>
					<EditProfileIntegrationsTab
						unexpectedError={unexpectedErrors[INTEGRATIONS_TAB]}
					/>
				</TabPanel>
			</TabContext>
			<FormModalActions>
				<ModalCancelButton disabled={isSubmitting} onClick={onClickClose} />
				{activeTab !== INTEGRATIONS_TAB && (
					<ModalSubmitButton
						disabled={!getTabSubmitFunction()}
						onClick={getTabSubmitFunction()}
						isPending={isSubmitting}
					>
						{CONFIRM_LABELS[activeTab]}
					</ModalSubmitButton>
				)}
			</FormModalActions>
		</FormModal>
	);
};

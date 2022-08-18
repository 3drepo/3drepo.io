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
 import { useState } from 'react';
 import { formatMessage } from '@/v5/services/intl';
 import { ICurrentUser } from '@/v5/store/currentUser/currentUser.types';
 import { TabContext } from '@mui/lab';
 import { FormModal, TabList, Tab, TabPanel, TruncatableName } from './editProfileModal.styles';
 import { EditProfilePersonalTab, IUpdatePersonalInputs } from './editProfilePersonalTab/editProfilePersonalTab.component';
 import { EditProfilePasswordTab, EMPTY_PASSWORDS, IUpdatePasswordInputs } from './editProfilePasswordTab/editProfilePasswordTab.component';
 import { EditProfileIntegrationsTab } from './editProfileIntegrationsTab/editProfileIntegrationsTab.component';
 import { FormProvider, useForm } from 'react-hook-form';
 import { yupResolver } from '@hookform/resolvers/yup';
 import { EditProfileUpdatePasswordSchema } from '@/v5/validation/userSchemes/editProfileSchemes';

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

export const EditProfileModal = ({ user, onClose }: EditProfileModalProps) => {
	const [activeTab, setActiveTab] = useState(PERSONAL_TAB);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [personalSubmitFunction, setPersonalSubmitFunction] = useState(null);
	const [passwordSubmitFunction, setPasswordSubmitFunction] = useState(null);
	const [hideSubmitButton, setHideSubmitButton] = useState(false);
	const [personalData, setPersonalData] = useState<IUpdatePersonalInputs>(null);
	const [incorrectPassword, setIncorrectPassword] = useState(false);

	const getTabSubmitFunction = () => {
		switch (activeTab) {
			case PERSONAL_TAB:
				return personalSubmitFunction;
			case PASSWORD_TAB:
				return passwordSubmitFunction;
			default:
				return null;
		}
	};

	const onTabChange = (_, selectedTab) => {
		setActiveTab(selectedTab);
		setHideSubmitButton(selectedTab === INTEGRATIONS_TAB);
	};

	const passwordFormData = useForm<IUpdatePasswordInputs>({
		reValidateMode: 'onChange',
		resolver: yupResolver(EditProfileUpdatePasswordSchema(incorrectPassword)),
		defaultValues: EMPTY_PASSWORDS,
	});

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
			hideSubmitButton={hideSubmitButton}
		>
			<TabContext value={activeTab}>
				<TabList onChange={onTabChange} textColor="primary" indicatorColor="primary">
					<Tab value={PERSONAL_TAB} label={TAB_LABELS.personal} disabled={isSubmitting} />
					<Tab value={PASSWORD_TAB} label={TAB_LABELS.password} disabled={isSubmitting} />
					<Tab value={INTEGRATIONS_TAB} label={TAB_LABELS.integrations} disabled={isSubmitting} />
				</TabList>
				<TabPanel value={PERSONAL_TAB} $zeroPadding>
					<EditProfilePersonalTab
						personalData={personalData}
						setPersonalData={setPersonalData}
						setIsSubmitting={setIsSubmitting}
						setSubmitFunction={setPersonalSubmitFunction}
						user={user}
					/>
				</TabPanel>
				<FormProvider {...passwordFormData}>
					<TabPanel value={PASSWORD_TAB}>
						<EditProfilePasswordTab
							incorrectPassword={incorrectPassword}
							setIncorrectPassword={setIncorrectPassword}
							setIsSubmitting={setIsSubmitting}
							setSubmitFunction={setPasswordSubmitFunction}
						/>
					</TabPanel>
				</FormProvider>
				<TabPanel value={INTEGRATIONS_TAB}>
					<EditProfileIntegrationsTab />
				</TabPanel>
			</TabContext>
		</FormModal>
	);
};

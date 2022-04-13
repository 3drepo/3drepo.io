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
import { IUser } from '@/v5/store/users/users.redux';
import { TabContext } from '@mui/lab';
import { defaults, pick } from 'lodash';
import { FormModal, TabList, Tab, TabPanel } from './editProfileModal.styles';
import { EditProfilePersonalTab, IUpdatePersonalInputs } from './editProfilePersonalTab/editProfilePersonalTab.component';
import { EditProfilePasswordTab, IUpdatePasswordInputs } from './editProfilePasswordTab/editProfilePasswordTab.component';
import { EditProfileIntegrationsTab } from './editProfileIntegrationsTab/editProfileIntegrationsTab.component';

const CONFIRM_LABELS = {
	personal: formatMessage({ defaultMessage: 'Update profile', id: 'editProfile.updateProfile' }),
	password: formatMessage({ defaultMessage: 'Update password', id: 'editProfile.updatePassword' }),
	integrations: formatMessage({ defaultMessage: 'Update profile', id: 'editProfile.updateIntegrations' }),
};

const TAB_LABELS = {
	personal: formatMessage({ defaultMessage: 'Personal', id: 'editProfile.tab.title.personal' }),
	password: formatMessage({ defaultMessage: 'Password', id: 'editProfile.tab.title.password' }),
	integrations: formatMessage({ defaultMessage: 'Integrations', id: 'editProfile.tab.title.integrations' }),
};

type EditProfileModalProps = {
	open: boolean;
	user: IUser;
	onClose: () => void;
};

export const EditProfileModal = ({ open, user, onClose }: EditProfileModalProps) => {
	const [passwordFields, setPasswordFields] = useState<IUpdatePasswordInputs>(null);
	const [personalFields, setPersonalFields] = useState<IUpdatePersonalInputs>(null);
	const [alreadyExistingEmails, setAlreadyExistingEmails] = useState([]);
	const [activeTab, setActiveTab] = useState(null);
	const [submitFunction, setSubmitFunctionWithCallback] = useState(null);
	const setSubmitFunction = (callback) => setSubmitFunctionWithCallback(() => callback);

	const updatePasswordFields = (fields: Partial<IUpdatePasswordInputs>) => {
		setPasswordFields({ ...passwordFields, ...fields });
	};

	const updatePersonalFields = (fields: Partial<IUpdatePersonalInputs>) => {
		setPersonalFields({ ...personalFields, ...fields });
	};

	const onTabChange = (_, selectedTab) => setActiveTab(selectedTab);

	useEffect(() => {
		if (open) {
			setActiveTab('personal');
			setAlreadyExistingEmails([]);
			setPasswordFields({
				currentPassword: '',
				newPassword: '',
				confirmPassword: '',
			});
			setPersonalFields(pick(
				defaults(user, { company: '', countryCode: 'GB' }),
				['firstName', 'lastName', 'email', 'company', 'countryCode'],
			));
		}
	}, [open]);

	return (
		<FormModal
			open={open}
			title={formatMessage(
				{ defaultMessage: "{firstName}'s profile", id: 'editProfile.title' },
				{ firstName: user.firstName },
			)}
			zeroMargin
			onClickClose={onClose}
			confirmLabel={CONFIRM_LABELS[activeTab]}
			onSubmit={submitFunction}
			isValid={submitFunction}
		>
			<TabContext value={activeTab}>
				<TabList
					onChange={onTabChange}
					textColor="primary"
					indicatorColor="primary"
				>
					<Tab value="personal" label={TAB_LABELS.personal} />
					<Tab value="password" label={TAB_LABELS.password} />
					<Tab value="integrations" label={TAB_LABELS.integrations} />
				</TabList>
				<TabPanel value="personal">
					<EditProfilePersonalTab
						setSubmitFunction={setSubmitFunction}
						fields={personalFields}
						alreadyExistingEmails={alreadyExistingEmails}
						updatePersonalFields={updatePersonalFields}
						user={user}
					/>
				</TabPanel>
				<TabPanel value="password">
					<EditProfilePasswordTab
						setSubmitFunction={setSubmitFunction}
						fields={passwordFields}
						updatePasswordFields={updatePasswordFields}
					/>
				</TabPanel>
				<TabPanel value="integrations">
					<EditProfileIntegrationsTab />
				</TabPanel>
			</TabContext>
		</FormModal>
	);
};

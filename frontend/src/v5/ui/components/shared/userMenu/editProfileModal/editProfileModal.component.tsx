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
import { CurrentUserActionsDispatchers } from '@/v5/services/actionsDispatchers/currentUsersActions.dispatchers';
import { TabContext } from '@mui/lab';
import { ScrollArea } from '@controls/scrollArea';
import { FormModal, TabList, Tab, TabPanel, ScrollAreaPadding } from './editProfileModal.styles';
import { EditProfilePersonalTab, getUserPersonalValues, IUpdatePersonalInputs } from './editProfilePersonalTab/editProfilePersonalTab.component';
import { EditProfilePasswordTab, EMPTY_PASSWORDS, IUpdatePasswordInputs } from './editProfilePasswordTab/editProfilePasswordTab.component';
import { EditProfileIntegrationsTab } from './editProfileIntegrationsTab/editProfileIntegrationsTab.component';

const CONFIRM_LABELS = {
	personal: formatMessage({ defaultMessage: 'Update profile', id: 'editProfile.tab.confirmButton.updateProfile' }),
	password: formatMessage({ defaultMessage: 'Update password', id: 'editProfile.tab.confirmButton.updatePassword' }),
	integrations: formatMessage({ defaultMessage: 'Update profile', id: 'editProfile.tab.confirmButton.updateIntegrations' }),
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
	// personal tab
	const [personalFields, setPersonalFields] = useState<IUpdatePersonalInputs>(null);
	const [newAvatarFile, setNewAvatarFile] = useState(null);
	const [alreadyExistingEmails, setAlreadyExistingEmails] = useState([]);

	const updatePersonalFields = (fields: Partial<IUpdatePersonalInputs>) => {
		setPersonalFields({ ...personalFields, ...fields });
	};

	// password tab
	const [passwordFields, setPasswordFields] = useState<IUpdatePasswordInputs>(null);

	const updatePasswordFields = (fields: Partial<IUpdatePasswordInputs>) => {
		setPasswordFields({ ...passwordFields, ...fields });
	};

	// all tabs
	const [activeTab, setActiveTab] = useState(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submitFunction, setSubmitFunctionWithCallback] = useState(null);
	const setSubmitFunction = (callback) => setSubmitFunctionWithCallback(() => callback);

	const onTabChange = (_, selectedTab) => setActiveTab(selectedTab);
	const onClickClose = () => {
		CurrentUserActionsDispatchers.resetErrors();
		onClose();
	};

	useEffect(() => {
		if (open) {
			setActiveTab('personal');
			setNewAvatarFile(null);
			setAlreadyExistingEmails([]);
			setPasswordFields(EMPTY_PASSWORDS);
			setPersonalFields(getUserPersonalValues(user));
		}
	}, [open]);

	useEffect(() => { CurrentUserActionsDispatchers.resetErrors(); }, [activeTab, open]);

	return (
		<FormModal
			open={open}
			title={formatMessage(
				{ defaultMessage: "{firstName}'s profile", id: 'editProfile.title' },
				{ firstName: user.firstName },
			)}
			zeroMargin
			onClickClose={onClickClose}
			confirmLabel={CONFIRM_LABELS[activeTab]}
			onSubmit={submitFunction}
			isValid={submitFunction || isSubmitting}
			isSubmitting={isSubmitting}
			$isPasswordTab={activeTab === 'password'}
		>
			<TabContext value={activeTab}>
				<TabList onChange={onTabChange} textColor="primary" indicatorColor="primary">
					<Tab value="personal" label={TAB_LABELS.personal} />
					<Tab value="password" label={TAB_LABELS.password} />
					<Tab value="integrations" label={TAB_LABELS.integrations} />
				</TabList>
				<TabPanel value="personal" $zeroSidePadding>
					<ScrollArea>
						<ScrollAreaPadding>
							<EditProfilePersonalTab
								setIsSubmitting={setIsSubmitting}
								setSubmitFunction={setSubmitFunction}
								fields={personalFields}
								alreadyExistingEmails={alreadyExistingEmails}
								updatePersonalFields={updatePersonalFields}
								user={user}
								newAvatarFile={newAvatarFile}
								setNewAvatarFile={setNewAvatarFile}
							/>
						</ScrollAreaPadding>
					</ScrollArea>
				</TabPanel>
				<TabPanel value="password">
					<EditProfilePasswordTab
						setIsSubmitting={setIsSubmitting}
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

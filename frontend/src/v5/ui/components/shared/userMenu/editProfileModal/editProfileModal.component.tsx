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
import { FormModal, TabList, Tab, TabPanel, TruncatableName } from './editProfileModal.styles';
import { EditProfilePersonalTab } from './editProfilePersonalTab/editProfilePersonalTab.component';
import { EditProfilePasswordTab } from './editProfilePasswordTab/editProfilePasswordTab.component';
import { EditProfileIntegrationsTab } from './editProfileIntegrationsTab/editProfileIntegrationsTab.component';
import { CurrentUserActionsDispatchers } from '@/v5/services/actionsDispatchers/currentUsersActions.dispatchers';

const CONFIRM_LABELS = {
	personal: formatMessage({ defaultMessage: 'Update profile', id: 'editProfile.tab.confirmButton.updateProfile' }),
	password: formatMessage({ defaultMessage: 'Update password', id: 'editProfile.tab.confirmButton.updatePassword' }),
	integrations: formatMessage({ defaultMessage: 'Update profile', id: 'editProfile.tab.confirmButton.updateIntegrations' }),
};

const TAB_LABELS = {
	password: formatMessage({ defaultMessage: 'Password', id: 'editProfile.tab.title.password' }),
	personal: formatMessage({ defaultMessage: 'Personal', id: 'editProfile.tab.title.personal' }),
	integrations: formatMessage({ defaultMessage: 'Integrations', id: 'editProfile.tab.title.integrations' }),
};

type EditProfileModalProps = {
	open: boolean;
	user: IUser;
	onClose: () => void;
};

export const EditProfileModal = ({ open, user, onClose }: EditProfileModalProps) => {
	const [activeTab, setActiveTab] = useState(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [personalSubmitFunction, setPersonalSubmitFunction] = useState(null);
	const [passwordSubmitFunction, setPasswordSubmitFunction] = useState(null);

	const getTabSubmitFunction = () => {
		switch (activeTab) {
			case 'personal':
				return personalSubmitFunction;
			case 'password':
				return passwordSubmitFunction;
			default:
				return null;
		}
	};

	const onTabChange = (_, selectedTab) => setActiveTab(selectedTab);
	const onClickClose = () => {
		onClose();
	};

	useEffect(() => {
		if (open) {
			setActiveTab('personal');
		}
		CurrentUserActionsDispatchers.resetErrors();
	}, [open]);

	return (
		<FormModal
			open={open}
			title={formatMessage(
				{ id: 'editProfile.title', defaultMessage: '{firstName}\'s profile' },
				{ firstName: <TruncatableName>{user.firstName}</TruncatableName> },
			)}
			zeroMargin
			onClickClose={onClickClose}
			confirmLabel={CONFIRM_LABELS[activeTab]}
			onSubmit={getTabSubmitFunction()}
			isValid={getTabSubmitFunction() || isSubmitting}
			isSubmitting={isSubmitting}
			$isPasswordTab={activeTab === 'password'}
			disableClosing={isSubmitting}
		>
			<TabContext value={activeTab}>
				<TabList onChange={onTabChange} textColor="primary" indicatorColor="primary">
					<Tab value="personal" label={TAB_LABELS.personal} disabled={isSubmitting} />
					<Tab value="password" label={TAB_LABELS.password} disabled={isSubmitting} />
					<Tab value="integrations" label={TAB_LABELS.integrations} disabled={isSubmitting} />
				</TabList>
			</TabContext>
			<TabPanel hidden={activeTab !== 'personal'} $zeroPadding>
				<EditProfilePersonalTab
					setIsSubmitting={setIsSubmitting}
					setSubmitFunction={setPersonalSubmitFunction}
					user={user}
				/>
			</TabPanel>
			<TabPanel hidden={activeTab !== 'password'}>
				<EditProfilePasswordTab
					setIsSubmitting={setIsSubmitting}
					setSubmitFunction={setPasswordSubmitFunction}
				/>
			</TabPanel>
			<TabPanel hidden={activeTab !== 'integrations'}>
				<EditProfileIntegrationsTab />
			</TabPanel>
		</FormModal>
	);
};

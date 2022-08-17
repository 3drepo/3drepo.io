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
import { TabContext } from '@mui/lab';
import { FormModal, TabList, Tab, TabPanel, TruncatableName } from './editProfileModal.styles';
import { EditProfilePersonalTab } from './editProfilePersonalTab/editProfilePersonalTab.component';
import { EditProfilePasswordTab } from './editProfilePasswordTab/editProfilePasswordTab.component';
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
	open: boolean;
	user: ICurrentUser;
	onClose: () => void;
};

export const EditProfileModal = ({ open, user, onClose }: EditProfileModalProps) => {
	const [activeTab, setActiveTab] = useState(PERSONAL_TAB);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [personalSubmitFunction, setPersonalSubmitFunction] = useState(null);
	const [passwordSubmitFunction, setPasswordSubmitFunction] = useState(null);
	const [hideSubmitButton, setHideSubmitButton] = useState(false);
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

	useEffect(() => {
		if (open) {
			setActiveTab(PERSONAL_TAB);
			setHideSubmitButton(false);
		}
	}, [open]);

	return (
		<FormModal
			open={open}
			title={formatMessage(
				{ id: 'editProfile.title', defaultMessage: '{firstName}\'s profile' },
				{ firstName: <TruncatableName>{user.firstName}</TruncatableName> },
			)}
			onClickClose={onClose}
			confirmLabel={CONFIRM_LABELS[activeTab]}
			onSubmit={getTabSubmitFunction()}
			isValid={getTabSubmitFunction()}
			isSubmitting={isSubmitting}
			$isPasswordTab={activeTab === PASSWORD_TAB}
			disableClosing={isSubmitting}
			hideSubmitButton={hideSubmitButton}
		>
			<TabContext value={activeTab}>
				<TabList onChange={onTabChange} textColor="primary" indicatorColor="primary">
					<Tab value={PERSONAL_TAB} label={TAB_LABELS.personal} disabled={isSubmitting} />
					<Tab value={PASSWORD_TAB} label={TAB_LABELS.password} disabled={isSubmitting} />
					<Tab value={INTEGRATIONS_TAB} label={TAB_LABELS.integrations} disabled={isSubmitting} />
				</TabList>
			</TabContext>
			<TabPanel hidden={activeTab !== PERSONAL_TAB} $zeroPadding>
				<EditProfilePersonalTab
					setIsSubmitting={setIsSubmitting}
					setSubmitFunction={setPersonalSubmitFunction}
					user={user}
				/>
			</TabPanel>
			<TabPanel hidden={activeTab !== PASSWORD_TAB}>
				<EditProfilePasswordTab
					setIsSubmitting={setIsSubmitting}
					setSubmitFunction={setPasswordSubmitFunction}
				/>
			</TabPanel>
			<TabPanel hidden={activeTab !== INTEGRATIONS_TAB}>
				<EditProfileIntegrationsTab isActiveTab={activeTab === INTEGRATIONS_TAB} />
			</TabPanel>
		</FormModal>
	);
};

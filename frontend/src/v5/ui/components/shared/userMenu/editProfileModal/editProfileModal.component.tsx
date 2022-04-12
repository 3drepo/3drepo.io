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
import { IUser } from '@/v5/store/users/users.redux';
import { TabContext } from '@mui/lab';
import { FormModal, TabList, Tab, TabPanel } from './editProfileModal.styles';
import { EditProfilePersonalTab } from './editProfilePersonalTab/editProfilePersonalTab.component';
import { EditProfilePasswordTab } from './editProfilePasswordTab/editProfilePasswordTab.component';
import { EditProfileIntegrationsTab } from './editProfileIntegrationsTab/editProfileIntegrationsTab.component';

const CONFIRM_LABELS = {
	personal: formatMessage({ defaultMessage: 'Update profile', id: 'editProfile.updateProfile' }),
	password: formatMessage({ defaultMessage: 'Update password', id: 'editProfile.updatePassword' }),
	integrations: formatMessage({ defaultMessage: 'Update profile', id: 'editProfile.updateIntegrations' }),
};

type EditProfileModalProps = {
	open: boolean;
	user: IUser;
	onClose: () => void;
};

export const EditProfileModal = ({ open, user, onClose }: EditProfileModalProps) => {
	const [activeTab, setActiveTab] = useState('personal');

	const updateProfile = () => {};
	const handleChange = (_, selectedTab) => setActiveTab(selectedTab);

	return (
		<FormModal
			open
			// TODO uncomment this
			// open={open}
			title={formatMessage(
				{ defaultMessage: "{firstName}'s profile", id: 'editProfile.title' },
				{ firstName: user.firstName },
			)}
			zeroMargin
			onClickClose={onClose}
			confirmLabel={CONFIRM_LABELS[activeTab]}
		>
			<TabContext value={activeTab}>
				<TabList
					onChange={handleChange}
					textColor="primary"
					indicatorColor="primary"
				>
					<Tab
						value="personal"
						label={formatMessage({
							defaultMessage: 'Personal',
							id: 'editProfile.tab.title.personal',
						})}
					/>
					<Tab
						value="password"
						label={formatMessage({
							defaultMessage: 'Password',
							id: 'editProfile.tab.title.password',
						})}
					/>
					<Tab
						value="integrations"
						label={formatMessage({
							defaultMessage: 'Integrations',
							id: 'editProfile.tab.title.integrations',
						})}
					/>
				</TabList>
				<TabPanel value="personal">
					<EditProfilePersonalTab />
				</TabPanel>
				<TabPanel value="password">
					<EditProfilePasswordTab />
				</TabPanel>
				<TabPanel value="integrations">
					<EditProfileIntegrationsTab />
				</TabPanel>
			</TabContext>
		</FormModal>
	);
};

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
import { FormModal } from '@controls/modal/formModal/formDialog.component';
import { IUser } from '@/v5/store/users/users.redux';
import { TabContext, TabPanel } from '@mui/lab';
import { TabList, Tab } from './editProfileModal.styles';

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
			open={open}
			title={formatMessage(
				{ defaultMessage: "{firstName}'s profile", id: 'editProfile.title' },
				{ firstName: user.firstName },
			)}
			zeroMargin
			onClickClose={onClose}
			confirmLabel={formatMessage({ defaultMessage: 'Update profile', id: 'editProfile.updateProfile' })}
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
						value="integration"
						label={formatMessage({
							defaultMessage: 'Integration',
							id: 'editProfile.tab.title.integration',
						})}
					/>
				</TabList>
				<TabPanel value="personal">
					Item One
				</TabPanel>
				<TabPanel value="password">
					Item Two
				</TabPanel>
				<TabPanel value="integration">
					Item Three
				</TabPanel>
			</TabContext>
		</FormModal>
	);
};

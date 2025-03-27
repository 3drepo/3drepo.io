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
import { defaults, isNull, omitBy, pick } from 'lodash';
import { TabContext } from '@mui/lab';
import { FormProvider, useForm } from 'react-hook-form';
import { useErrorInterceptor } from '@controls/errorMessage/useErrorInterceptor';
import { yupResolver } from '@hookform/resolvers/yup';
import { EditProfileUpdatePersonalSchema } from '@/v5/validation/userSchemes/editProfileSchemes';
import { CurrentUserHooksSelectors } from '@/v5/services/selectorsHooks';
import { FormModal, TabList, Tab, TabPanel, TruncatableName } from './editProfileModal.styles';
import { EditProfilePersonalTab, IUpdatePersonalInputs } from './editProfilePersonalTab/editProfilePersonalTab.component';
import { EditProfilePasswordTab } from './editProfilePasswordTab/editProfilePasswordTab.component';
import { EditProfileIntegrationsTab } from './editProfileIntegrationsTab/editProfileIntegrationsTab.component';
import { userHasMissingRequiredData } from '@/v5/store/users/users.helpers';

const PERSONAL_TAB = 'personal';
const PASSWORD_TAB = 'password';
const INTEGRATIONS_TAB = 'integrations';

const TAB_LABELS = {
	personal: formatMessage({ defaultMessage: 'Personal', id: 'editProfile.tab.title.personal' }),
	password: formatMessage({ defaultMessage: 'Password', id: 'editProfile.tab.title.password' }),
	integrations: formatMessage({ defaultMessage: 'Integrations', id: 'editProfile.tab.title.integrations' }),
};

type EditProfileUnexpectedErrors = {
	[PERSONAL_TAB]?: any;
	[INTEGRATIONS_TAB]?: any;
};

type EditProfileModalProps = {
	open: boolean;
	onClickClose: () => void;
	initialTab?: 'password' | 'integrations';
};
export const EditProfileModal = ({ open, onClickClose: defaultOnClickClose, initialTab }: EditProfileModalProps) => {
	const [activeTab, setActiveTab] = useState(initialTab || PERSONAL_TAB);
	const [unexpectedErrors, setUnexpectedErrors] = useState<EditProfileUnexpectedErrors>({});
	const interceptedError = useErrorInterceptor();
	const user = CurrentUserHooksSelectors.selectCurrentUser();
	const onClickClose = userHasMissingRequiredData(user) ? null : defaultOnClickClose;

	const defaultPersonalValues = defaults(
		pick(omitBy(user, isNull), ['firstName', 'lastName', 'email', 'company', 'countryCode']),
		{ company: '', avatarFile: '' },
	);

	const onTabChange = (_, selectedTab) => setActiveTab(selectedTab);

	const personalFormData = useForm<IUpdatePersonalInputs>({
		mode: 'all',
		resolver: yupResolver(EditProfileUpdatePersonalSchema),
		defaultValues: defaultPersonalValues,
	});

	const isSubmitting = personalFormData.formState.isSubmitting;

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
			contrastColorHeader
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
							unexpectedError={unexpectedErrors[PERSONAL_TAB]}
							onClickClose={onClickClose}
						/>
					</TabPanel>
				</FormProvider>
				<TabPanel value={PASSWORD_TAB}>
					<EditProfilePasswordTab onClickClose={onClickClose} />
				</TabPanel>
				<TabPanel value={INTEGRATIONS_TAB}>
					<EditProfileIntegrationsTab
						unexpectedError={unexpectedErrors[INTEGRATIONS_TAB]}
						onClickClose={onClickClose}
					/>
				</TabPanel>
			</TabContext>
		</FormModal>
	);
};

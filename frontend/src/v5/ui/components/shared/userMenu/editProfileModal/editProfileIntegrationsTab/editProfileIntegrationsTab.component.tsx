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

import { ShareTextField } from '@controls/shareTextField';
import { formatMessage } from '@/v5/services/intl';
import { FormattedMessage } from 'react-intl';
import { CurrentUserHooksSelectors } from '@/v5/services/selectorsHooks/currentUserSelectors.hooks';
import { CurrentUserActionsDispatchers } from '@/v5/services/actionsDispatchers/currentUsersActions.dispatchers';
import { ButtonsContainer, Button } from './editProfileIntegrationsTab.styles';

export const EditProfileIntegrationsTab = () => {
	const key = CurrentUserHooksSelectors.selectApiKey();

	const generateApiKey = () => CurrentUserActionsDispatchers.generateApiKey();
	const deleteApiKey = () => CurrentUserActionsDispatchers.deleteApiKey();

	return (
		<>
			<ShareTextField
				label={formatMessage({
					id: 'editProfile.apiKey',
					defaultMessage: 'API KEY',
				})}
				value={key}
				hideValue
			/>
			<ButtonsContainer>
				<Button variant="outlined" color="primary" onClick={generateApiKey}>
					<FormattedMessage
						id="editProfile.generateApiKey"
						defaultMessage="Generate"
					/>
				</Button>
				<Button variant="outlined" color="secondary" onClick={deleteApiKey} disabled={!key}>
					<FormattedMessage
						id="editProfile.deleteApiKey"
						defaultMessage="Delete"
					/>
				</Button>
			</ButtonsContainer>
		</>
	);
};

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
import { FormattedMessage } from 'react-intl';
import { CurrentUserHooksSelectors } from '@/v5/services/selectorsHooks';
import { CurrentUserActionsDispatchers } from '@/v5/services/actionsDispatchers';

import { UnhandledError } from '@controls/errorMessage/unhandledError/unhandledError.component';
import { ButtonsContainer, Button, ShareTextFieldLabel } from './editProfileIntegrationsTab.styles';

type EditProfileIntegrationsTabProps = {
	unexpectedError: any,
};

export const EditProfileIntegrationsTab = ({
	unexpectedError,
}: EditProfileIntegrationsTabProps) => {
	const apiKey = CurrentUserHooksSelectors.selectApiKey();

	const { generateApiKey, deleteApiKey } = CurrentUserActionsDispatchers;

	return (
		<>
			<ShareTextField
				label={(
					<ShareTextFieldLabel>
						<FormattedMessage
							id="editProfile.form.apiKey"
							defaultMessage="API KEY"
						/>
					</ShareTextFieldLabel>
				)}
				value={apiKey}
				hideValue
				disabled={!apiKey}
			/>
			<ButtonsContainer>
				<Button variant="outlined" color="primary" onClick={generateApiKey}>
					<FormattedMessage
						id="editProfile.form.generateApiKey"
						defaultMessage="Generate"
					/>
				</Button>
				<Button variant="outlined" color="secondary" onClick={deleteApiKey} disabled={!apiKey}>
					<FormattedMessage
						id="editProfile.form.deleteApiKey"
						defaultMessage="Delete"
					/>
				</Button>
			</ButtonsContainer>
			<UnhandledError error={unexpectedError} />
		</>
	);
};

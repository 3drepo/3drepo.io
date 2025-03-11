/**
 *  Copyright (C) 2023 3D Repo Ltd
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

import { FormattedMessage } from 'react-intl';
import { FormModalActions } from '@controls/formModal/modalButtons/modalButtons.styles';
import { ModalCancelButton } from '@controls/formModal/modalButtons/modalButtons.component';
import { TabContent } from '../editProfileModal.styles';
import { FronteggTitleText } from './editProfileAuthenticationTab.styles';

type EditProfileAuthenticationTabProps = {
	onClickClose: () => void,
};

export const EditProfileAuthenticationTab = ({ onClickClose }: EditProfileAuthenticationTabProps) => (
	<>
		<TabContent>
			<FronteggTitleText>
				<FormattedMessage
					id="editProfile.authentication.title"
					defaultMessage="Edit password"
				/>
			</FronteggTitleText>
			To be implemented
		</TabContent>
		<FormModalActions>
			<ModalCancelButton onClick={onClickClose} />
		</FormModalActions>
	</>
);

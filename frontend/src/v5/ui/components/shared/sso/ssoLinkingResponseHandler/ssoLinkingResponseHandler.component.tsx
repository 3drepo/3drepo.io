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

import { DialogsActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { postActions } from '@/v5/services/api/sso';
import { CurrentUserHooksSelectors } from '@/v5/services/selectorsHooks';
import { useSSOParams } from '@/v5/services/sso.hooks';
import { EditProfileModal } from '@components/shared/userMenu/editProfileModal/editProfileModal.component';
import { useEffect } from 'react';

export const SSOResponseHandler = () => {
	const { username } = CurrentUserHooksSelectors.selectCurrentUser();
	const { action } = useSSOParams()[0];

	useEffect(() => {
		const isSSOLinkAction = [postActions.LINK_POST, postActions.UNLINK_POST].includes(action);
		if (!username || !isSSOLinkAction) return;
		DialogsActionsDispatchers.open(EditProfileModal, { initialTab: 'authentication' });
	}, [username]);

	return (<></>);
};

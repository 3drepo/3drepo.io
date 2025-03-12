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
import { CurrentUserHooksSelectors } from '@/v5/services/selectorsHooks';
import { userHasMissingRequiredData } from '@/v5/store/users/users.helpers';
import { EditProfileModal } from '@components/shared/userMenu/editProfileModal/editProfileModal.component';
import { useEffect } from 'react';

export const NewUserHandler = () => {
	const user = CurrentUserHooksSelectors.selectCurrentUser();

	useEffect(() => {
		if (!user.username) return;
		if (userHasMissingRequiredData(user)) {
			DialogsActionsDispatchers.open(EditProfileModal);
		}
	}, [user.username]);

	return (<></>);
};

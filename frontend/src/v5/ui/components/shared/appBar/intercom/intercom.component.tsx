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

import { AuthHooksSelectors, CurrentUserHooksSelectors } from '@/v5/services/selectorsHooks';
import QuestionMarkIcon from '@assets/icons/filled/question-filled.svg';
import { NavbarButton } from '@controls/navbarButton/navbarButton.styles';
import { useEffect } from 'react';
import { useIntercom } from 'react-use-intercom';

const intercomLauncherId = 'intercomLauncher';

export const Intercom = () => {
	const { boot, hardShutdown } = useIntercom();
	const currentUser = CurrentUserHooksSelectors.selectCurrentUser();
	const isAuthenticated = AuthHooksSelectors.selectIsAuthenticated();

	const setNameAndMail = () => {
		const { firstName, lastName, email, intercomRef } = currentUser;
		const name = `${firstName || ''} ${lastName || ''}`.trim();

		try {
			boot({
				name,
				email,
				userHash: intercomRef,
				customLauncherSelector: `#${intercomLauncherId}`,
				hideDefaultLauncher: true,
			});
		} catch (e) {
			console.debug(`Intercom api error: ${e}`);
		}
	};

	useEffect(() => {
		if (isAuthenticated && currentUser.email) {
			setNameAndMail();
		} else {
			hardShutdown();
		}
	}, [isAuthenticated, currentUser.email]);

	if (!isAuthenticated || !currentUser.email) return null;

	return (
		<NavbarButton id={intercomLauncherId}>
			<QuestionMarkIcon />
		</NavbarButton>
	);
};

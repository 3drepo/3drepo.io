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

import { EditProfileAuthenticationSSOTab } from './editProfileAuthenticationSSOTab.component';
import { EditProfileAuthenticationNonSSOTab } from './editProfileAuthenticationBasicNonSSOTab.component';
import { CurrentUserHooksSelectors } from '@/v5/services/selectorsHooks';

export interface IUpdatePasswordInputs {
	oldPassword: string;
	newPassword: string;
	confirmPassword: string;
}

export const EMPTY_PASSWORDS = {
	oldPassword: '',
	newPassword: '',
	confirmPassword: '',
};

type EditProfileAuthenticationTabProps = {
	incorrectPassword: boolean;
	setIncorrectPassword: (isIncorrect: boolean) => void;
	setIsSubmitting: (isSubmitting: boolean) => void;
	unexpectedError: any,
	onClickClose: () => void,
};

export const EditProfileAuthenticationTab = ({
	incorrectPassword,
	setIncorrectPassword,
	...props
}: EditProfileAuthenticationTabProps) => {
	const { sso } = CurrentUserHooksSelectors.selectCurrentUser();

	if (sso) return (<EditProfileAuthenticationSSOTab {...props} />);

	return (
		<EditProfileAuthenticationNonSSOTab
			incorrectPassword={incorrectPassword}
			setIncorrectPassword={setIncorrectPassword}
			{...props}
		/>
	);
};

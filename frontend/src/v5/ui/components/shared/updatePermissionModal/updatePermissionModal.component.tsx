/**
 *  Copyright (C) 2024 3D Repo Ltd
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
import { IInfoModal, InfoModal } from '../modalsDispatcher/templates/infoModal/infoModal.component';
import { formatMessage } from '@/v5/services/intl';
import { isPermissionModalSuppressed } from './updatePermissionModal.helpers';
import { WarningIcon } from '../modalsDispatcher/modalsDispatcher.styles';

type UpdatePermissionProps = {
	onConfirm: () => void,
	permissionsType: string,
	permissionsCount?: number,
};
export const UpdatePermissionModal = ({ onConfirm, permissionsType, permissionsCount = 1, ...props }: IInfoModal & UpdatePermissionProps) => (
	<InfoModal
		Icon={WarningIcon}
		primaryButtonLabel='Cancel'
		secondaryButtonLabel='Continue'
		onClickSecondary={onConfirm}
		message={formatMessage({
			id: 'permissionsModal.message',
			defaultMessage: `
				You are about to change {permissionsCount} {permissionsCount, plural, one {user} other {users}}
				permissions to {permissionsType}.{br}Are you sure you would like to proceed?
			`,
		}, { permissionsCount, permissionsType, br: <br /> })}
		{...props}
	/>
);

export const updatePermissionsOrTriggerModal = (props: UpdatePermissionProps) => {
	if (isPermissionModalSuppressed()) {
		props.onConfirm();
		return;
	}
	DialogsActionsDispatchers.open(UpdatePermissionModal, props);
};

/**
 *  Copyright (C) 2021 3D Repo Ltd
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
import { DialogsActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { IDialogConfig } from '@/v5/store/dialogs/dialogs.redux';
import { MODAL_TEMPLATES } from './templates';
import { useSyncPropsEffect } from '@/v5/helpers/syncProps.hooks';
import { DialogsHooksSelectors } from '@/v5/services/selectorsHooks';

const ModalTemplateContainer = ({ id, modalType, props, syncProps }: IDialogConfig) => {
	const [openState, setOpenState] = useState(true);

	const modalProps = useSyncPropsEffect(syncProps || props || {});

	const onClickClose = (...args) => {
		setOpenState(false);
		setTimeout(() => DialogsActionsDispatchers.close(id), 500);
		modalProps.onClose?.(...args);
	};

	if (syncProps) {
		Object.assign(modalProps, props);
	}

	const Modal = (typeof modalType === 'string') ? MODAL_TEMPLATES[modalType] : modalType;
	return (<Modal open={openState} onClickClose={onClickClose} {...modalProps} />);
};

export const ModalsDispatcher = (): JSX.Element => {
	const dialogs = DialogsHooksSelectors.selectDialogs();

	return (
		<>
			{dialogs.map((dialog) => <ModalTemplateContainer key={dialog.id} {...dialog} />)}
		</>
	);
};

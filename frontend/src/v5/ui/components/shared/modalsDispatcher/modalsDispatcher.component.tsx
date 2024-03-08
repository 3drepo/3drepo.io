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
import { useSelector } from 'react-redux';
import { DialogsActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { selectDialogs } from '@/v5/store/dialogs/dialogs.selectors';
import { IDialogConfig } from '@/v5/store/dialogs/dialogs.redux';
import { MODAL_TEMPLATES } from './templates';
import { useSyncPropsEffect } from '@/v5/helpers/syncProps.hooks';

const ModalTemplateContainer = ({ id, modalType, props }: IDialogConfig) => {
	const [openState, setOpenState] = useState(true);

	const onClickClose = () => {
		setOpenState(false);
		setTimeout(() => DialogsActionsDispatchers.close(id), 500);
	};

	const modalProps = useSyncPropsEffect(props);

	const Modal = (typeof modalType === 'string') ? MODAL_TEMPLATES[modalType] : modalType;
	return (<Modal open={openState} onClickClose={onClickClose} {...modalProps} />);
};

export const ModalsDispatcher = (): JSX.Element => {
	const dialogs = useSelector(selectDialogs);

	return (
		<>
			{dialogs.map((dialog) => <ModalTemplateContainer key={dialog.id} {...dialog} />)}
		</>
	);
};

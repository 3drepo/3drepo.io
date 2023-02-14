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

import { ModalType } from '@/v5/store/dialogs/dialogs.redux';
import CloseIcon from '@assets/icons/outlined/close-outlined.svg';
import { Dialog, CloseButton } from './modal.styles';

interface IModal {
	onClickClose: () => void;
	open:boolean;
	children:any;
	className?: string;
	type?: ModalType;
}

export const Modal = ({ onClickClose, children, ...props }: IModal) => (
	<Dialog
		onClose={onClickClose}
		maxWidth="md"
		{...props}
	>
		<CloseButton aria-label="Close dialog" onClick={onClickClose}>
			<CloseIcon />
		</CloseButton>
		{children}
	</Dialog>
);

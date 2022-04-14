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
import { Dialog } from '@mui/material';

import CloseIcon from '@assets/icons/close.svg';
import { CloseButton } from './modal.styles';

interface IModal {
	onClickClose: () => void;
	open:boolean;
	children:any;
	className?: string;
}

export const Modal = ({ onClickClose, open, children, className }: IModal) => (
	<Dialog
		open={open}
		onClose={onClickClose}
		className={className}
		maxWidth={false}
	>
		<CloseButton aria-label="Close dialog" onClick={onClickClose}>
			<CloseIcon />
		</CloseButton>
		{children}
	</Dialog>
);

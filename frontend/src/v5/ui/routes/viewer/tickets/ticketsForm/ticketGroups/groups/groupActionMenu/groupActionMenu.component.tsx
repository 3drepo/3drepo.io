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

import { ReactNode, useState } from 'react';
import { ActionMenuContext } from '@controls/actionMenu/actionMenuContext';
import { useSelector } from 'react-redux';
import { selectLeftPanels } from '@/v4/modules/viewerGui';
import { Container } from '@controls/actionMenu/actionMenu.styles';
import { VIEWER_PANELS } from '@/v4/constants/viewerGui';
import { Popper } from './groupActionMenu.styles';

type ITicketsGroupActionMenu = {
	TriggerButton: ReactNode;
	onClose?: (e) => void;
	children: any;
};

export const TicketsGroupActionMenu = ({ TriggerButton, onClose, children }: ITicketsGroupActionMenu) => {
	const [open, setOpen] = useState(false);
	const leftPanels = useSelector(selectLeftPanels);
	const isSecondaryCard = leftPanels[0] !== VIEWER_PANELS.TICKETS;

	const handleClose = (e) => {
		setOpen(false);
		onClose?.(e);
	};

	return (
		<ActionMenuContext.Provider value={{ close: handleClose }}>
			<Container onClick={() => setOpen(true)}>
				{TriggerButton}
			</Container>
			<Popper
				open={open}
				style={{ /* style is required to override the default positioning style Popper gets */
					left: 460,
					top: isSecondaryCard ? 'unset' : 80,
					bottom: isSecondaryCard ? 40 : 'unset',
				}}
			>
				{children}
			</Popper>
		</ActionMenuContext.Provider>
	);
};

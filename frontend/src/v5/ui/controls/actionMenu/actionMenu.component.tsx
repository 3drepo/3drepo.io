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

import React, { ReactNode } from 'react';
import { ClickAwayListener, Grow } from '@material-ui/core';
import {
	Menu,
	Popper,
	Paper,
} from './actionMenu.styles';

type ActionMenuProps = {
	className?: string;
	anchorEl: HTMLElement | null;
	children: ReactNode
	handleClose: () => void;
};

export const ActionMenu = ({ className, anchorEl, children, handleClose }: ActionMenuProps) => (
	<Popper
		open={Boolean(anchorEl)}
		anchorEl={anchorEl}
		transition
		disablePortal
		className={className}
		placement="bottom-end"
	>
		{({ TransitionProps, placement }) => (
			<Grow
				{...TransitionProps}
				style={{
					transformOrigin: placement === 'bottom-end' ? 'center top' : 'center bottom',
				}}
			>
				<Paper>
					<ClickAwayListener onClickAway={handleClose}>
						<Menu>
							{children}
						</Menu>
					</ClickAwayListener>
				</Paper>
			</Grow>
		)}
	</Popper>
);

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

import React, { Dispatch, ReactNode } from 'react';
import { ClickAwayListener, Grow, Paper, Typography } from '@material-ui/core';
import { MenuList, MenuItem, Popper } from './ellipsisMenu.styles';

interface IListItem {
	title: ReactNode;
	onClick: Dispatch<void>;
}

export interface IEllipsisMenu {
	anchorEl: null | HTMLElement;
	handleClose: () => void;
	list: IListItem[];
}

export const EllipsisMenu = ({ anchorEl, handleClose, list }: IEllipsisMenu): JSX.Element => {
	const handleListKeyDown = (event) => {
		if (event.key === 'Tab') {
			event.preventDefault();
			handleClose();
		}
	};

	return (
		<Popper
			open={Boolean(anchorEl)}
			anchorEl={anchorEl}
			transition
			disablePortal
			placement="bottom-end"
		>
			{({ TransitionProps, placement }) => (
				<Grow
					{...TransitionProps}
					style={{ transformOrigin: placement === 'bottom-end' ? 'center top' : 'center bottom' }}
				>
					<Paper>
						<ClickAwayListener onClickAway={handleClose}>
							<MenuList autoFocusItem={Boolean(anchorEl)} id="ellipsis-menu-list" onKeyDown={handleListKeyDown}>
								{list.map(({ title, onClick }) => (
									<MenuItem
										onClick={(event) => {
											event.stopPropagation();
											onClick(event);
											handleClose();
										}}
									>
										<Typography variant="body1" noWrap>
											{title}
										</Typography>
									</MenuItem>
								))}
							</MenuList>
						</ClickAwayListener>
					</Paper>
				</Grow>
			)}
		</Popper>
	);
};

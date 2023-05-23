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
import { ReactNode, useState } from 'react';
import { Popover } from '@mui/material';
import { Menu, Container } from './actionMenu.styles';
import { ActionMenuContext } from './actionMenuContext';

type ActionMenuProps = {
	className?: string;
	children: ReactNode;
	TriggerButton: any;
	PopoverProps?: any;
	onOpen?: (e) => void;
	onClose?: (e) => void;
	disabled?: boolean;
};
export const ActionMenu = ({
	className,
	TriggerButton,
	children,
	PopoverProps,
	onOpen,
	onClose,
	disabled,
}: ActionMenuProps) => {
	const [anchorEl, setAnchorEl] = useState(null);

	const stopClickPropagation = (e) => {
		e.stopPropagation();
		e.preventDefault();
	};

	const handleOpen = (e) => {
		setAnchorEl(e.currentTarget.children[0]);
		onOpen?.(e);
		stopClickPropagation(e);
	};

	const handleClose = (e) => {
		setAnchorEl(null);
		onClose?.(e);
	};

	const handlePopoverClick = (e: Event) => {
		PopoverProps?.onClick?.(e);
		handleClose(e);
	};

	return (
		<ActionMenuContext.Provider value={{ close: handleClose }}>
			<Container onClick={handleOpen}>
				{TriggerButton}
			</Container>
			<Popover
				open={!disabled && Boolean(anchorEl)}
				anchorEl={anchorEl}
				className={className}
				anchorOrigin={{
					vertical: 'bottom',
					horizontal: 'center',
				}}
				transformOrigin={{
					vertical: 'top',
					horizontal: 'center',
				}}
				{...PopoverProps}
				onClick={handlePopoverClick}
			>
				<Menu onClick={stopClickPropagation}>
					{children}
				</Menu>
			</Popover>
		</ActionMenuContext.Provider>
	);
};

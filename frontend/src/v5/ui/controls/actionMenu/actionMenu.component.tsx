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
import { ReactNode, useEffect, useState } from 'react';
import { Popover } from '@mui/material';
import { Menu, Container } from './actionMenu.styles';
import { ActionMenuContext } from './actionMenuContext';

type ActionMenuProps = {
	className?: string;
	children: ReactNode;
	TriggerButton: any;
	PopoverProps?: any;
	onOpen?: () => void;
	onClose?: () => void;
	disabled?: boolean;
};
export const ActionMenu = ({
	TriggerButton,
	className,
	children,
	PopoverProps,
	onOpen,
	onClose,
	disabled,
}: ActionMenuProps) => {
	const [anchorEl, setAnchorEl] = useState(null);

	const handleOpen = (e) => {
		if (disabled) return;
		setAnchorEl(e.currentTarget.children[0]);
		e.stopPropagation();
		e.preventDefault();
	};

	const handlePopoverClick = (e: Event) => {
		PopoverProps?.onClick?.(e);
		setAnchorEl(null);
		e.stopPropagation();
		e.preventDefault();
	};

	useEffect(() => {
		if (anchorEl) {
			onOpen?.();
			return () => onClose?.();
		}
		return () => {};
	}, [anchorEl]);

	return (
		<ActionMenuContext.Provider value={{ close: () => setAnchorEl(null) }}>
			<Container onClick={handleOpen}>
				{TriggerButton}
			</Container>
			<Popover
				open={Boolean(anchorEl)}
				anchorEl={anchorEl}
				anchorOrigin={{
					vertical: 'bottom',
					horizontal: 'center',
				}}
				transformOrigin={{
					vertical: 'top',
					horizontal: 'center',
				}}
				className={className}
				{...PopoverProps}
				onClick={handlePopoverClick}
			>
				<Menu onClick={(e) => e.stopPropagation()}>
					{children}
				</Menu>
			</Popover>
		</ActionMenuContext.Provider>
	);
};

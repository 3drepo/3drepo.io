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
import { ReactNode, useState, Children, ReactElement, cloneElement } from 'react';
import { ClickAwayListener, Popover } from '@mui/material';
import { Menu } from './actionMenu.styles';

const applyCloseMenuToActionMenuItems = (el: any, handleClose: () => void) => {
	if (el?.type?.isActionMenuClosingElement) {
		return cloneElement(el, {
			onClick: () => {
				el.props.onClick?.();
				handleClose();
			},
		});
	}

	if (el?.props?.children) {
		return cloneElement(el, {
			children: Children.map(el.props.children, (child) => applyCloseMenuToActionMenuItems(child, handleClose)),
		});
	}

	return el;
};

type ActionMenuProps = {
	className?: string;
	children: ReactNode;
	TriggerButton: any;
	PopoverProps?: any;
};

export const ActionMenu = ({
	className,
	TriggerButton: TriggerButtonInput,
	children,
	PopoverProps,
}: ActionMenuProps) => {
	const [anchorEl, setAnchorEl] = useState(null);
	const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => setAnchorEl(event.currentTarget);
	const handleClose = () => setAnchorEl(null);

	const TriggerButton = cloneElement(TriggerButtonInput as ReactElement, {
		onClick: (e) => {
			TriggerButtonInput.props.onClick?.(e);
			handleClick(e);
		},
	});

	const MenuChildren = Children.toArray(children).map((child) => applyCloseMenuToActionMenuItems(child, handleClose));

	return (
		<>
			{TriggerButton}
			<Popover
				open={Boolean(anchorEl)}
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
			>
				<ClickAwayListener onClickAway={handleClose}>
					<Menu>
						{MenuChildren}
					</Menu>
				</ClickAwayListener>
			</Popover>
		</>
	);
};

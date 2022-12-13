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

import { useState, cloneElement, MouseEvent } from 'react';
import { formatMessage } from '@/v5/services/intl';
import { ClickAwayListener, Tooltip, MenuList } from '@mui/material';
import { EllipsisButton } from '@controls/ellipsisButton';
import { Popover } from './ellipsisMenu.styles';

export interface IEllipsisMenu {
	selected?: boolean;
	children: JSX.Element[];
	className?: string;
}

export const EllipsisMenu = ({ selected, children, className }: IEllipsisMenu): JSX.Element => {
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

	const handleClickDropdown = (event: MouseEvent<HTMLDivElement>) => {
		event.stopPropagation();
		event.preventDefault();
		setAnchorEl(event.currentTarget);
	};

	const handleCloseDropdown = () => {
		setAnchorEl(null);
	};

	const handleListKeyDown = (event) => {
		if (event.key === 'Tab') {
			event.preventDefault();
			handleCloseDropdown();
		}
	};

	return (
		<>
			<Tooltip title={formatMessage({ id: 'ellipsisMenu.tooltip', defaultMessage: 'More options' })}>
				<div onClick={handleClickDropdown} aria-hidden>
					<EllipsisButton
						aria-controls="ellipsis-menu-list"
						aria-haspopup="true"
						variant={selected ? 'secondary' : 'primary'}
						className={className}
					/>
				</div>
			</Tooltip>
			<Popover
				open={Boolean(anchorEl)}
				anchorEl={anchorEl}
				anchorOrigin={{
					vertical: 'bottom',
					horizontal: 'center',
				}}
				transformOrigin={{
					vertical: 'top',
					horizontal: 'right',
				}}
			>
				<ClickAwayListener onClickAway={handleCloseDropdown}>
					<MenuList autoFocusItem={Boolean(anchorEl)} id="ellipsis-menu-list" onKeyDown={handleListKeyDown}>
						{children.map((child) => (
							cloneElement(child, {
								...child.props,
								key: child.props.title,
								onClick: (event) => {
									event.stopPropagation();
									child.props.onClick?.call(event);
									handleCloseDropdown();
								},
							})
						))}
					</MenuList>
				</ClickAwayListener>
			</Popover>
		</>
	);
};

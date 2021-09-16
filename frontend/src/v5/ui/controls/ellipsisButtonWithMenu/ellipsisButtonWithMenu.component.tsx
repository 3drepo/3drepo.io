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

import React, { MouseEvent } from 'react';
import { EllipsisButton } from '@controls/ellipsisButton';
import { EllipsisMenu, IEllipsisMenu } from '@controls/ellipsisMenu/ellipsisMenu.component';

export type IEllipsisButtonWithMenu = {
	list: IEllipsisMenu['list'];
};

export const EllipsisButtonWithMenu = ({ list }: IEllipsisButtonWithMenu): JSX.Element => {
	const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

	const handleClickDropdown = (event: MouseEvent<HTMLButtonElement>) => {
		event.stopPropagation();
		setAnchorEl(event.currentTarget);
	};

	const handleCloseDropdown = () => {
		setAnchorEl(null);
	};

	return (
		<>
			<EllipsisButton
				aria-controls="ellipsis-menu"
				aria-haspopup="true"
				onClick={(event) => {
					event.stopPropagation();
					handleClickDropdown(event);
				}}
				isOn={Boolean(anchorEl)}
			/>
			<EllipsisMenu
				anchorEl={anchorEl}
				handleClose={handleCloseDropdown}
				list={list}
			/>
		</>
	);
};

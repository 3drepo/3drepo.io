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

import { ReactElement, useState } from 'react';
import { PopoverContainer } from './popover.styles';

type IPopover = {
	anchor: (props) => ReactElement;
	children: ReactElement;
};

export const Popover = ({ anchor: AnchorEl, children }: IPopover) => {
	const [anchorEl, setAnchorEl] = useState<Element | null>(null);
	const onMouseEnter = (event) => setAnchorEl(event.currentTarget);
	const onMouseLeave = () => setAnchorEl(null);

	return (
		<span onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
			<AnchorEl />
			<PopoverContainer
				open={!!anchorEl}
				anchorEl={anchorEl}
			>
				{children}
			</PopoverContainer>
		</span>
	);
};

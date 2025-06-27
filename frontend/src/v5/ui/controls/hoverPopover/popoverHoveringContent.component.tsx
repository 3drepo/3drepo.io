/**
 *  Copyright (C) 2025 3D Repo Ltd
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

import { useState, useRef } from 'react';
import { PopoverHoveringContentContainer } from './hoverPopover.styles';

// Similar to HoverPopover, but the Popover content is hoverable
// as the latter stays open
// TODO - merge with HoverPopover and use a prop to allow hovering content
export const PopoverHoveringContent = ({ anchor: AnchorEl, children, ...props }) => {
	const [open, setOpen] = useState(false);
	const anchor = useRef(null);

	const onMouseEnter = () => setOpen(true);
	const onMouseLeave = () => setOpen(false);

	return (
		<>
			<span
				ref={anchor}
				onMouseEnter={onMouseEnter}
				onMouseLeave={onMouseLeave}
			>
				<AnchorEl />
			</span>
			<PopoverHoveringContentContainer
				open={open}
				anchorEl={anchor.current}
				slotProps={{
					paper: { onMouseEnter, onMouseLeave },
				}}
				{...props}
			>
				{children}
			</PopoverHoveringContentContainer>
		</>
	);
};

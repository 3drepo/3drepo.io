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
import { EllipsisMenuItem } from '@controls/ellipsisMenu/ellipsisMenuItem';
import { MenuList } from '@mui/material';
import ChevronIcon from '@assets/icons/outlined/thin_chevron-outlined.svg';
import { ExpandIconContainer } from './expandingMenu.styles';
import { PopoverHoveringContent } from '@controls/hoverPopover/popoverHoveringContent.component';

export const ExpandingMenu = ({ children, title }) => (
	<PopoverHoveringContent
		anchor={() => (
			<EllipsisMenuItem
				title={
					<>
						{title}
						<ExpandIconContainer>
							<ChevronIcon />
						</ExpandIconContainer>
					</>
				}
			/>
		)}
	>
		<MenuList>
			{children}
		</MenuList>
	</PopoverHoveringContent>
);

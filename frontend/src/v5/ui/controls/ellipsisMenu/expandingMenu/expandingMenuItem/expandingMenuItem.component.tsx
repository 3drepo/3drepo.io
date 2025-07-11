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

import { ActionMenuItem } from '@controls/actionMenu';
import { EllipsisMenuItem } from '@controls/ellipsisMenu/ellipsisMenuItem';
import TickIcon from '@assets/icons/outlined/tick-outlined.svg';
import { EllipsisMenuItemProps } from '@controls/ellipsisMenu/ellipsisMenuItem/ellipsisMenutItem.component';

type ExpandingMenuItemProps = EllipsisMenuItemProps & { selected?: boolean };
export const ExpandingMenuItem = ({ title, selected, ...props }: ExpandingMenuItemProps) => (
	<ActionMenuItem>
		<EllipsisMenuItem
			{...props}
			title={
				<>
					{title}
					{selected && <TickIcon />}
				</>
			}
		/>
	</ActionMenuItem>
);
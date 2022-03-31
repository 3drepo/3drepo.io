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
import { Link, ItemIcon, ItemText } from './actionMenuItemLink.styles';
import { ActionMenuItem } from '../actionMenuItem/actionMenuItem.component';

type ActionMenuItemLinkProps = {
	className?: string;
	Icon?: any;
	to?: string;
	children?: React.ReactNode;
};

export const ActionMenuItemLink = ({ Icon, to, children, ...otherProps }: ActionMenuItemLinkProps) => (
	<ActionMenuItem {...otherProps}>
		<Link to={to}>
			{Icon && (
				<ItemIcon>
					<Icon />
				</ItemIcon>
			)}
			<ItemText>{children}</ItemText>
		</Link>
	</ActionMenuItem>
);
ActionMenuItemLink.isActionMenuClosingElement = true;

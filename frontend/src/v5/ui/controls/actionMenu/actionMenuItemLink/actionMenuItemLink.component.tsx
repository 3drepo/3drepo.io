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
import { ItemIcon, ItemText, LinkWrapper } from './actionMenuItemLink.styles';
import { Link } from 'react-router-dom';

type ActionMenuItemLinkProps = {
	className?: string;
	Icon?: any;
	to?: string;
	children?: React.ReactNode;
	onClick?: () => void;
};

export const ActionMenuItemLink = ({ Icon, to, children, ...otherProps }: ActionMenuItemLinkProps) => {
	const ConditionalLink = (props) => to ? <Link  to={to} {...props}/> : <a {...props} />;
	return (
		<LinkWrapper {...otherProps}>
			<ConditionalLink>
				{Icon && (
					<ItemIcon>
						<Icon />
					</ItemIcon>
				)}
				<ItemText>{children}</ItemText>
			</ConditionalLink>
		</LinkWrapper>
	);
};
ActionMenuItemLink.isActionMenuClosingElement = true;

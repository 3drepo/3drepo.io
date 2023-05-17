/**
 *  Copyright (C) 2023 3D Repo Ltd
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

import { EllipsisMenu } from '@controls/ellipsisMenu';
import { TitleContainer, ViewActionMenu } from './viewActionEllipsisMenu.styles';

type ViewActionEllipsisMenuProps = {
	hasValue: boolean;
	disabled: boolean;
	onClick: () => any;
	Icon: any;
	title: any;
	children: any;
};
export const ViewActionEllipsisMenu = ({ hasValue, disabled, Icon, title, children, onClick }: ViewActionEllipsisMenuProps) => (
	<ViewActionMenu>
		<TitleContainer disabled={!hasValue} onClick={hasValue ? onClick : () => {}}>
			<Icon />
			{title}
		</TitleContainer>
		<EllipsisMenu disabled={disabled}>
			{children}
		</EllipsisMenu>
	</ViewActionMenu>
);

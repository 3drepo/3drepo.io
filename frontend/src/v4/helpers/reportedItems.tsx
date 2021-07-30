/**
 *  Copyright (C) 2020 3D Repo Ltd
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

import { ArrowRight } from '@material-ui/icons';
import React from 'react';
import { FoldableMenu, FoldableMenuItem, SubMenu } from '../routes/components/foldableMenu/foldableMenu.component';

export interface IHeaderMenuItem {
	label: string;
	enabled?: boolean;
	Icon?: any;
	isSorting?: boolean;
	onClick?: (event?) => void;
	subItems?: IHeaderMenuItem[];
}

const renderIcon = (Icon) => {
	if (!Icon) {
		return null;
	}

	return <Icon fontSize="small" />;
};

const renderMenuItem = ({ label, Icon, onClick, enabled, subItems }: IHeaderMenuItem, index) => (
	<FoldableMenuItem
		key={index}
		button
		checked={enabled}
		onClick={onClick}
		icon={renderIcon(Icon)}
	>
		{label} {subItems && <ArrowRight />}
	</FoldableMenuItem>
);

export const renderActionsMenu = (headerMenuItems: IHeaderMenuItem[]) => (
	<FoldableMenu>
		{
			headerMenuItems.map((item, index) => {
				if (!item.subItems) {
					return renderMenuItem(item, index);
				} else {
					return (<SubMenu key={index} left>
						{renderMenuItem(item, index)}
						{renderActionsMenu(item.subItems)}
					</SubMenu>);
				}
			})
		}
	</FoldableMenu>
);

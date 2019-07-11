/**
 *  Copyright (C) 2017 3D Repo Ltd
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

import Bookmarks from '@material-ui/icons/Bookmarks';
import BookmarksOutlined from '@material-ui/icons/BookmarksOutlined';
import * as React from 'react';

import { hasPermissions } from '../../../../helpers/permissions';
import { renderWhenTrue } from '../../../../helpers/rendering';
import { TreeList, TREE_LEVELS } from '../../../components/treeList/treeList.component';
import { ROW_ACTIONS } from '../../teamspaces.contants';
import { TooltipButton } from '../tooltipButton/tooltipButton.component';

interface IProps {
	name: string;
	items: any[];
	renderChildItem: () => JSX.Element;
	onAddClick: (event) => void;
	permissions: any[];
}

export const ModelDirectoryItem = (props: IProps) => {
	const { renderChildItem, name, items, onAddClick, permissions } = props;

	const hasFedPermissions = hasPermissions('create_federation', permissions);
	const hasModelPermissions = hasPermissions('create_model', permissions);

	const renderActions = () => renderWhenTrue(() => (
		<TooltipButton
			{...ROW_ACTIONS.ADD_NEW}
			label={`Add new ${name.slice(0, -1).toLowerCase()}`}
			action={onAddClick}
		/>
	))(hasFedPermissions || hasModelPermissions) as any;

	return (
		<TreeList
			name={name}
			items={items}
			level={TREE_LEVELS.MODEL}
			renderItem={renderChildItem}
			active={true}
			disableShadow={true}
			forceActive={true}
			IconProps={ {
				IconOpened: BookmarksOutlined,
				IconClosed: Bookmarks
			} }
			renderActions={renderActions}
		/>
	);
};

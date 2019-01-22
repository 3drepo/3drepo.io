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

import * as React from 'react';

import { TreeList } from '../../../components/treeList/treeList.component';
import { MyTeamspaceItem } from '../myTeamspaceItem/myTeamspaceItem.component';
import { ROW_ACTIONS } from '../../teamspaces.contants';
import { TooltipButton } from '../tooltipButton/tooltipButton.component';

import StorageNormal from '@material-ui/icons/Storage';
import StorageOutlined from '@material-ui/icons/StorageOutlined';

import { hasPermissions } from '../../../../helpers/permissions';
import { renderWhenTrue } from '../../../../helpers/rendering';

interface IProps {
	account: string;
	projects: any[];
	active: boolean;
	isMyTeamspace: boolean;
	onToggle: () => void;
	renderChildItem: () => JSX.Element;
	onAddProject: () => void;
	permissions: any[];
}

export const TeamspaceItem = (props: IProps) => {
	const {
		account,
		projects,
		onToggle,
		active,
		renderChildItem,
		isMyTeamspace,
		onAddProject,
		permissions
	} = props;

	const renderActions = () => renderWhenTrue(() => (
		<TooltipButton
			{...ROW_ACTIONS.ADD_NEW}
			label="Add new project"
			action={onAddProject}
		/>
	))(hasPermissions('create_project', permissions)) as any;

	return (
		<TreeList
			name={account}
			level={1}
			items={projects}
			onRootClick={onToggle}
			active={active}
			renderItem={renderChildItem}
			renderRoot={isMyTeamspace ? MyTeamspaceItem : null}
			IconProps={{
				IconOpened: StorageOutlined,
				IconClosed: StorageNormal
			}}
			renderActions={renderActions}
		/>
	);
};

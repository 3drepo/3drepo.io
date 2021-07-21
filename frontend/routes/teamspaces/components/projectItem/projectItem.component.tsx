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

import Label from '@material-ui/icons/Label';
import LabelOutlined from '@material-ui/icons/LabelOutlined';
import React from 'react';

import { ROUTES } from '../../../../constants/routes';
import { encodeElementId } from '../../../../helpers/html';
import { hasPermissions } from '../../../../helpers/permissions';
import { renderWhenTrue } from '../../../../helpers/rendering';
import { TreeList, TREE_LEVELS } from '../../../components/treeList/treeList.component';
import { ROW_ACTIONS  } from '../../teamspaces.contants';
import ProjectDialog from '../projectDialog/projectDialog.container';
import { RowMenu } from '../rowMenu/rowMenu.component';
import { TooltipButton } from '../tooltipButton/tooltipButton.component';

interface IProps {
	_id: string;
	name: string;
	query?: string;
	models: any[];
	disabled: boolean;
	isEmpty: boolean;
	permissions: any[];
	teamspace: string;
	history: any;
	active?: boolean;
	showStarredOnly?: boolean;
	renderChildItem: () => JSX.Element;
	removeProject: (teamspace, projectId) => void;
	showConfirmDialog: (config) => void;
	showDialog: (config) => void;
	onPermissionsClick: (event) => void;
	onClick: (projectName) => void;
}

interface IState {
	actionsMenuOpen: boolean;
}

export class ProjectItem extends React.PureComponent<IProps, IState> {
	public state = {
		actionsMenuOpen: false
	};

	public handleRemove = (event) => {
		event.stopPropagation();
		this.props.showConfirmDialog({
			title: 'Delete project',
			content: `
				Do you really want to delete project <b>${this.props.name}</b>? <br /><br />
				This will remove the project from your teamspace,
				deleting all the models inside of it!
			`,
			onConfirm: () => {
				this.props.removeProject(this.props.teamspace, this.props._id);
			}
		});
	}

	public handlePermissionsClick = (event) => {
		event.stopPropagation();
		const {teamspace, name} = this.props;

		this.props.history.push({
			pathname: `${ROUTES.USER_MANAGEMENT_MAIN}/${teamspace}/projects`,
			search: `?project=${encodeURIComponent(name)}`
		});
	}

	public handleEditClick = (event) => {
		event.stopPropagation();
		const { teamspace, name, _id } = this.props;

		this.props.showDialog({
			title: 'Edit project',
			template: ProjectDialog,
			data: {
				id: _id,
				name,
				teamspace,
			},
		});
	}

	public toggleActionsMenuOpen = (event) => {
		event.preventDefault();
		event.stopPropagation();
		this.setState({actionsMenuOpen: !this.state.actionsMenuOpen});
	}

	private handleClick = () => {
		const { _id } = this.props;
		this.props.onClick({ id: _id });
	}

	public isProjectAdmin = () => hasPermissions('admin_project', this.props.permissions);

	public renderProjectActions = ({ hovered }) => renderWhenTrue(() => (
		<RowMenu
			open={hovered}
			forceOpen={this.state.actionsMenuOpen}
			toggleForceOpen={this.toggleActionsMenuOpen}
		>
			<TooltipButton
				{...ROW_ACTIONS.EDIT}
				action={this.handleEditClick}
			/>
			<TooltipButton
				{...ROW_ACTIONS.PERMISSIONS}
				action={this.handlePermissionsClick}
			/>
			<TooltipButton
				{...ROW_ACTIONS.DELETE}
				action={this.handleRemove}
			/>
		</RowMenu>
	))(this.isProjectAdmin()) as any

	public render() {
		const { name, disabled, isEmpty, query, active, showStarredOnly } = this.props;
		return (
			<TreeList
				id={'project-' + encodeElementId(name)}
				active={active}
				query={query}
				onClick={this.handleClick}
				name={name}
				level={TREE_LEVELS.PROJECT}
				disabled={disabled}
				isEmpty={isEmpty}
				IconProps={{
					IconClosed: Label,
					IconOpened: LabelOutlined
				}}
				showStarredOnly={showStarredOnly}
			>
				{this.renderProjectActions}
			</TreeList>
		);
	}
}

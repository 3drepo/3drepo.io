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
import { groupBy, isEmpty, isEqual } from 'lodash';
import React from 'react';

import { ROUTES } from '../../../../constants/routes';
import { hasPermissions } from '../../../../helpers/permissions';
import { renderWhenTrue } from '../../../../helpers/rendering';
import { TreeList, TREE_LEVELS } from '../../../components/treeList/treeList.component';
import { FEDERATION_TYPE, MODEL_TYPE, ROW_ACTIONS  } from '../../teamspaces.contants';
import { RowMenu } from '../rowMenu/rowMenu.component';
import { TooltipButton } from '../tooltipButton/tooltipButton.component';

interface IProps {
	_id: string;
	name: string;
	models: any[];
	active: boolean;
	permissions: any[];
	teamspace: string;
	history: any;
	renderChildItem: () => JSX.Element;
	onEditClick: (event) => void;
	removeProject: (teamspace, projectId) => void;
	showConfirmDialog: (config) => void;
	onPermissionsClick: (event) => void;
	onRootClick: (projectName) => void;
}

interface IState {
	items: any[];
	actionsMenuOpen: boolean;
}

const splitModels = (modelsList = []) => {
	const { federations = [], models = [] } = groupBy(modelsList, ({ federate }) => {
		return federate ? 'federations' : 'models';
	});

	return { federations, models };
};

const getProjectItems = (modelsList, projectName) => {
	const { federations = [], models = [] } = splitModels(modelsList);

	return [{
		name: 'Federations',
		items: federations,
		type: FEDERATION_TYPE,
		projectName
	}, {
		name: 'Models',
		items: models,
		type: MODEL_TYPE,
		projectName
	}];
};

export class ProjectItem extends React.PureComponent<IProps, IState> {
	public state = {
		items: [],
		actionsMenuOpen: false
	};

	public componentDidMount() {
		this.setState({
			items: getProjectItems(this.props.models, this.props.name)
		});
	}

	public componentDidUpdate(prevProps: IProps) {
		const changes = {} as IState;

		const modelsChanged = !isEqual(this.props.models, prevProps.models);
		if (modelsChanged) {
			changes.items = getProjectItems(this.props.models, this.props.name);
		}

		if (!isEmpty(changes)) {
			this.setState(changes);
		}
	}

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

		this.props.history.push({
			pathname: `${ROUTES.USER_MANAGEMENT_MAIN}/${this.props.teamspace}/projects`,
			search: `?project=${this.props.name}`
		});
	}

	public toggleActionsMenuOpen = (event) => {
		event.stopPropagation();
		this.setState({actionsMenuOpen: !this.state.actionsMenuOpen});
	}

	private handleClick = (...args) => {
		this.props.onRootClick({ ...args, models: this.props.models });
	}

	public isProjectAdmin = () => hasPermissions('admin_project', this.props.permissions);

	public renderProjectActions = ({ hovered }) => renderWhenTrue(() => (
		<RowMenu open={hovered} forceOpen={this.state.actionsMenuOpen} toggleForceOpen={this.toggleActionsMenuOpen}>
			<TooltipButton
				{...ROW_ACTIONS.EDIT}
				action={this.props.onEditClick}
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
		const { renderChildItem, name, active } = this.props;
		const { items } = this.state;

		return (
			<TreeList
				onClick={this.handleClick}
				name={name}
				level={TREE_LEVELS.PROJECT}
				items={items}
				IconProps={ {
					IconClosed: Label,
					IconOpened: LabelOutlined
				} }
				renderItem={renderChildItem}
				renderActions={this.renderProjectActions}
				active={active}
			/>
		);
	}
}

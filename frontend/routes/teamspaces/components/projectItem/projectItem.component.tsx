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
import { groupBy, isEmpty, isEqual } from 'lodash';
import Label from '@material-ui/icons/Label';
import LabelOutlined from '@material-ui/icons/LabelOutlined';

import { TreeList } from '../../../components/treeList/treeList.component';
import { TooltipButton } from '../tooltipButton/tooltipButton.component';
import { ROW_ACTIONS, MODEL_TYPE, FEDERATION_TYPE  } from '../../teamspaces.contants';
import { RowMenu } from '../rowMenu/rowMenu.component';
import { renderWhenTrue } from '../../../../helpers/rendering';
import { hasPermissions } from '../../../../helpers/permissions';

interface IProps {
	name: string;
	models: any[];
	active: boolean;
	permissions: any[];
	renderChildItem: () => JSX.Element;
	onEditClick: (event) => void;
	onRemoveClick: (event) => void;
	onPermissionsClick: (event) => void;
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

	public toggleActionsMenuOpen = (event) => {
		event.stopPropagation();
		this.setState({actionsMenuOpen: !this.state.actionsMenuOpen});
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
				action={this.props.onPermissionsClick}
			/>
			<TooltipButton
				{...ROW_ACTIONS.DELETE}
				action={this.props.onRemoveClick}
			/>
		</RowMenu>
	))(this.isProjectAdmin()) as any

	public render() {
		const { renderChildItem, name, active } = this.props;
		const { items } = this.state;

		return (
			<TreeList
				name={name}
				level={2}
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

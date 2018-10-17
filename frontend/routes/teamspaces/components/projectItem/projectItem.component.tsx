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

import { TreeList } from '../../../components/treeList/treeList.component';
import { TooltipButton } from '../tooltipButton/tooltipButton.component';
import { ROW_ACTIONS } from '../../teamspaces.contants';
import { RowMenu } from '../rowMenu/rowMenu.component';

interface IProps {
	name: string;
	models: any[];
	renderChildItem: () => JSX.Element;
	onEditClick: (event) => void;
	onRemoveClick: (event) => void;
	onPermissionsClick: (event) => void;
}

interface IState {
	items: any[];
}

const splitModels = (modelsList = []) => {
	const { federations = [], models = [] } = groupBy(modelsList, ({ federate }) => {
		return federate ? 'federations' : 'models';
	});

	return { federations, models };
};

const getProjectItems = (modelsList) => {
	const { federations = [], models = [] } = splitModels(modelsList);

	return [{
		name: 'Federations',
		items: federations
	}, {
		name: 'Models',
		items: models
	}];
};

export class ProjectItem extends React.PureComponent<IProps, IState> {
	public state = {
		items: []
	};

	public componentDidMount() {
		this.setState({
			items: getProjectItems(this.props.models)
		});
	}

	public componentDidUpdate(prevProps: IProps) {
		const changes = {} as IState;

		const modelsChanged = !isEqual(this.props.models, prevProps.models);
		if (modelsChanged) {
			changes.items = getProjectItems(this.props.models);
		}

		if (!isEmpty(changes)) {
			this.setState(changes);
		}
	}

	public renderProjectActions = ({ hovered }) => (
		<RowMenu open={hovered}>
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
	)

	public render() {
		const { renderChildItem, name } = this.props;
		const { items } = this.state;

		return (
			<TreeList
				name={name}
				level={2}
				items={items}
				renderItem={renderChildItem}
				renderActions={this.renderProjectActions}
			/>
		);
	}
}

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
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Icon from '@material-ui/core/Icon';
import Tooltip from '@material-ui/core/Tooltip';

import { DateTime } from '../../../components/dateTime/dateTime.component';
import { Container, SubmodelsList, Time } from './modelItem.styles';
import { RowMenu } from '../rowMenu/rowMenu.component';

interface IAction {
	label: string;
	icon: string;
	action: () => void;
	color?: string;
}
interface IProps {
	name: string;
	federate: boolean;
	model: string;
	subModels?: any[];
	timestamp: string;
	actions: IAction[];
}

interface IState {
	hovered: boolean;
}

export class ModelItem extends React.PureComponent<IProps, IState> {
	public state = {
		hovered: false
	};

	public renderSubModels = (subModels = []) => {
		const submodelsAsString = subModels.map(({ name }) => name).join(', ');
		return subModels.length ? <SubmodelsList>{ submodelsAsString }</SubmodelsList> : null;
	}

	public renderActions = (actions) => {
		return actions ? actions.map(({label, action, icon, color}, index) => {
			const iconProps = {color, fontSize: 'small'} as any;
			return (
				<Tooltip title={label} key={index}>
					<IconButton aria-label={label} onClick={action}>
						<Icon {...iconProps}>{icon}</Icon>
					</IconButton>
				</Tooltip>
			);
		}) : null;
	}

	public createHoverHandler = (hovered) => () => {
		this.setState({ hovered });
	}

	public render() {
		const { name, subModels, timestamp, actions } = this.props;
		const { hovered } = this.state;

		return (
			<Container
				onMouseEnter={this.createHoverHandler(true)}
				onMouseLeave={this.createHoverHandler(false)}
			>
				<Grid
					container
					direction="row"
					alignItems="center"
					justify="space-between"
					wrap="nowrap"
				>
					<Grid container>{name}</Grid>
					<Grid
						container
						wrap="nowrap"
						direction="row"
						alignItems="center"
						justify="flex-end">
						<Time>{timestamp ? <DateTime value={timestamp} format="D ddd" /> : null}</Time>
						<RowMenu open={hovered}>
							{this.renderActions(actions)}
						</RowMenu>
					</Grid>
				</Grid>
				{this.renderSubModels(subModels)}
			</Container>
		);
	}
}

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
import Popover from '@material-ui/core/Popover';
import Tooltip from '@material-ui/core/Tooltip';

import { DateTime } from '../../../components/dateTime/dateTime.component';
import { Container, SubmodelsList, Time } from './modelItem.styles';

interface IProps {
	name: string;
	federate: boolean;
	model: string;
	subModels?: any[];
	timestamp: string;
	onUpload?: () => void;
	onDownload?: () => void;
	onDelete?: () => void;
	onEdit?: () => void;
	onRevisionsOpen?: () => void;
	onSettingsOpen?: () => void;
}

interface IState {
	activeMenu: boolean;
}

export class ModelItem extends React.PureComponent<IProps, IState> {
	public state = {
		activeMenu: false
	};

	public buttonRef = React.createRef<HTMLElement>();

	public menuActions = [{
		label: 'Delete',
		action: this.props.onDelete,
		icon: 'remove'
	}, {
		label: 'Upload',
		action: this.props.onUpload,
		icon: 'cloud_upload'
	}, {
		label: 'Edit',
		action: this.props.onEdit
	}, {
		label: 'Revisions',
		action: this.props.onRevisionsOpen
	}, {
		label: 'Settings',
		action: this.props.onSettingsOpen
	}];

	public toggleMenu = (forceHide) => {
		this.setState({
			activeMenu: forceHide ? false : !this.state.activeMenu
		});
	}

	public renderSubModels = (subModels = []) => {
		const submodelsAsString = subModels.map(({ name }) => name).join(', ');
		return subModels.length ? <SubmodelsList>{ submodelsAsString }</SubmodelsList> : null;
	}

	public renderActions = () => {
		return this.menuActions.map(({label, action, icon}, index) => {
			return (
				<Tooltip title={label} key={index}>
					<IconButton aria-label={label} onClick={action}>
						<Icon>{icon}</Icon>
					</IconButton>
				</Tooltip>
			);
		});
	}

	public render() {
		const { name, subModels, timestamp } = this.props;
		const { activeMenu } = this.state;

		return (
			<Container>
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
						direction="row"
						alignItems="center"
						justify="flex-end">
						<Time>{timestamp ? <DateTime value={timestamp} format="D ddd" /> : null}</Time>
						<IconButton
							buttonRef={this.buttonRef}
							aria-label="More"
							aria-haspopup="true"
							onClick={this.toggleMenu.bind(this, null)}
						>
							<Icon>more_vert</Icon>
						</IconButton>
						<Popover
							open={activeMenu}
							elevation={0}
							anchorEl={this.buttonRef.current}
							anchorOrigin={{
								vertical: 'center',
								horizontal: 'left'
							}}
							transformOrigin={{
								vertical: 'center',
								horizontal: 'right'
							}}
							onClose={this.toggleMenu.bind(this, false)}
						>
							<Grid container direction="row">
								{this.renderActions()}
							</Grid>
						</Popover>
					</Grid>
				</Grid>
				{this.renderSubModels(subModels)}
			</Container>
		);
	}
}

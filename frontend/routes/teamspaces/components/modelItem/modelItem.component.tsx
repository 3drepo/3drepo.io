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

import { startCase } from 'lodash';
import * as React from 'react';

import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';

import { hasPermissions } from '../../../../helpers/permissions';
import { renderWhenTrue } from '../../../../helpers/rendering';
import { DateTime } from '../../../components/dateTime/dateTime.component';
import { Loader } from '../../../components/loader/loader.component';

import { LONG_DATE_TIME_FORMAT } from '../../../../services/formatting/formatDate';
import { ROW_ACTIONS } from '../../teamspaces.contants';
import { RowMenu } from '../rowMenu/rowMenu.component';
import { Container, LinkedName, Name, Status, SubmodelsList, Time, TimeWrapper } from './modelItem.styles';

interface IAction {
	label: string;
	Icon: React.ComponentType;
	action: () => void;
	color?: string;
	isHidden?: boolean;
	requiredPermissions?: string;
}
interface IProps {
	name: string;
	activeTeamspace: string;
	status: string;
	federate: boolean;
	model: string;
	projectName: string;
	subModels?: any[];
	timestamp: string;
	permissions?: any[];
	onModelItemClick: (event) => void;
	onModelUpload: (event) => void;
	onRevisionsClick: (event) => void;
	onDownloadClick: (event) => void;
	onSettingsClick: (event) => void;
	onPermissionsClick: (event) => void;
	subscribeOnStatusChange: (teamspace, project, modelData) => void;
	unsubscribeOnStatusChange: (teamspace, project, modelData) => void;
}

interface IState {
	hovered: boolean;
	actionsMenuOpen: boolean;
}

const isPendingStatus = (status) => status &&
	status === 'uploading' || status === 'queued' || status === 'processing';

export class ModelItem extends React.PureComponent<IProps, IState> {
	public state = {
		hovered: false,
		statusText: '',
		actionsMenuOpen: false
	};

	private modelActions: IAction[] = [];
	private federationActions: IAction[] = [];

	constructor(props) {
		super(props);

		const sharedActions = [{
			...ROW_ACTIONS.SETTINGS,
			action: props.onSettingsClick
		}, {
			...ROW_ACTIONS.PERMISSIONS,
			action: props.onPermissionsClick
		}, {
			...ROW_ACTIONS.DELETE,
			action: props.onDeleteClick
		}];

		this.modelActions = [{
			...ROW_ACTIONS.UPLOAD_FILE,
			action: props.onModelUpload
		}, {
			...ROW_ACTIONS.REVISIONS,
			action: props.onRevisionsClick
		}, {
			...ROW_ACTIONS.DOWNLOAD,
			action: props.onDownloadClick,
			isHidden: !Boolean(props.timestamp)
		}, ...sharedActions];

		this.federationActions = [{
			...ROW_ACTIONS.EDIT,
			action: props.onEditClick
		}, ...sharedActions];
	}

	public componentDidMount = () => {
		const { activeTeamspace, projectName, model, subscribeOnStatusChange, name, federate } = this.props;
		if (!federate) {
			const modelData = { modelId: model, modelName: name };
			subscribeOnStatusChange(activeTeamspace, projectName, modelData);
		}
	}

	public componentWillUnmount = () => {
		const { activeTeamspace, projectName, model, unsubscribeOnStatusChange, name, federate } = this.props;
		if (!federate) {
			const modelData = { modelId: model, modelName: name };
			unsubscribeOnStatusChange(activeTeamspace, projectName, modelData);
		}
	}

	public renderSubModels = (subModels = []) => {
		const submodelsAsString = subModels.map(({ name }) => name).join(', ');

		return subModels.length ? <SubmodelsList>{submodelsAsString}</SubmodelsList> : null;
	}

	public renderActions = (actions) => {
		const { permissions } = this.props;
		return actions ? actions.map((actionItem, index) => {
			const {label, action, Icon, color, isHidden = false, requiredPermissions = ''} = actionItem;
			const iconProps = {color, fontSize: 'small'} as any;

			if (!isHidden && !isPendingStatus(this.props.status)) {
				return renderWhenTrue((
					<Tooltip title={label} key={index}>
						<IconButton aria-label={label} onClick={action}>
							<Icon {...iconProps} />
						</IconButton>
					</Tooltip>
				))(hasPermissions(requiredPermissions, permissions));
			}
		}) : null;
	}

	public createHoverHandler = (hovered) => () => {
		this.setState({ hovered });
	}

	public renderPendingStatus = (status) => (
		<Status>
			<Loader content={`${startCase(status)}...`} size={20} horizontal={true} />
		</Status>
	)

	public toggleActionsMenuOpen = (event) => {
		event.stopPropagation();
		this.setState({actionsMenuOpen: !this.state.actionsMenuOpen});
	}

	public render() {
		const { name, subModels, timestamp, onModelItemClick, status } = this.props;
		const { hovered, actionsMenuOpen } = this.state;
		const isFederation = Boolean(subModels);
		const actions = isFederation ? this.federationActions : this.modelActions;
		const isPending = isPendingStatus(status);
		const showLink = !!timestamp;

		return(
				<Container onMouseEnter={this.createHoverHandler(true)} onMouseLeave={this.createHoverHandler(false)}>
					<Grid container={true} direction="row" alignItems="center" justify="space-between" wrap="nowrap">
						<Grid container={true} justify="space-between" wrap="nowrap" alignItems="center">
							{ isPending
								? ( showLink
									? <><LinkedName onClick={onModelItemClick}>{name}</LinkedName> {this.renderPendingStatus(status)}</>
									: <><Name>{name}</Name>{this.renderPendingStatus(status)}</>)
								: <LinkedName onClick={onModelItemClick}>{name}</LinkedName>
							}
						</Grid>
						<TimeWrapper
							container={true}
							wrap="nowrap"
							direction="row"
							alignItems="center"
							justify="flex-end"
							pending={isPending ? 1 : 0}
						>
							{ timestamp && !hovered && !isPending && !actionsMenuOpen &&
								<Time>
									<DateTime value={timestamp} format={LONG_DATE_TIME_FORMAT} />
								</Time>
							}
							<RowMenu
								open={hovered}
								disabled={isPending}
								forceOpen={actionsMenuOpen}
								toggleForceOpen={this.toggleActionsMenuOpen}
							>
								{this.renderActions(actions)}
							</RowMenu>
						</TimeWrapper>
					</Grid>
					{this.renderSubModels(subModels)}
			</Container>
		);
	}
}

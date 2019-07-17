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
import memoizeOne from 'memoize-one';
import React from 'react';

import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';

import { hasPermissions } from '../../../../helpers/permissions';
import { renderWhenTrue } from '../../../../helpers/rendering';
import { DateTime } from '../../../components/dateTime/dateTime.component';
import { Loader } from '../../../components/loader/loader.component';

import { LONG_DATE_TIME_FORMAT } from '../../../../services/formatting/formatDate';
import { ROW_ACTIONS, FEDERATION_TYPE, MODEL_TYPE } from '../../teamspaces.contants';
import { RowMenu } from '../rowMenu/rowMenu.component';
import { Container, LinkedName, Name, Status, SubmodelsList, Time, TimeWrapper } from './modelItem.styles';
import { ROUTES } from '../../../../constants/routes';
import { PERMISSIONS_VIEWS } from '../../../projects/projects.component';
import { EVENT_CATEGORIES, analyticsService, EVENT_ACTIONS } from '../../../../services/analytics';
import RevisionsDialog from '../revisionsDialog/revisionsDialog.container';

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
	history: any;
	activeTeamspace: string;
	status: string;
	federate: boolean;
	model: string;
	projectName: string;
	subModels?: any[];
	timestamp: string;
	permissions?: any[];
	showDialog: (config) => void;
	showConfirmDialog: (config) => void;
	updateModel: (teamspace, modelName, modelData) => void;
	removeModel: (teamspace, modelData) => void;
	downloadModel: (teamspace, modelId) => void;

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
			action: this.handleSettingsClick
		}, {
			...ROW_ACTIONS.PERMISSIONS,
			action: this.handlePermissionsClick
		}, {
			...ROW_ACTIONS.DELETE,
			action: this.handleDownloadClick
		}];

		this.modelActions = [{
			...ROW_ACTIONS.UPLOAD_FILE,
			action: props.onModelUpload
		}, {
			...ROW_ACTIONS.REVISIONS,
			action: this.handleRevisionsClick
		}, {
			...ROW_ACTIONS.DOWNLOAD,
			action: this.handleDownloadClick,
			isHidden: !Boolean(props.timestamp)
		}, ...sharedActions];

		this.federationActions = [{
			...ROW_ACTIONS.EDIT,
			action: props.onEditClick
		}, ...sharedActions];
	}

	public get isFederation() {
		return this.props.federate ? FEDERATION_TYPE : MODEL_TYPE;
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

	public handlePermissionsClick = (event) => {
		event.stopPropagation();
		const { history, projectName, activeTeamspace, model } = this.props;
		history.push({
			pathname: `${ROUTES.USER_MANAGEMENT_MAIN}/${activeTeamspace}/projects`,
			search: `?project=${projectName}&modelId=${model}&view=${PERMISSIONS_VIEWS.MODELS}`
		});
	}

	public handleSettingsClick = () => {
		event.stopPropagation();
		const { history, projectName, activeTeamspace, model } = this.props;
		history.push({
			pathname: `${ROUTES.MODEL_SETTINGS}/${activeTeamspace}/models/${model}`,
			search: `?project=${projectName}`
		});
	}

	public handleDownloadClick = () => {
		this.props.downloadModel(this.props.activeTeamspace, this.props.model);
	}

	public handleRevisionsClick = () => {
		event.stopPropagation();
		const { activeTeamspace, model, name } = this.props;

		this.props.showDialog({
			title: `${name} - Revisions`,
			template: RevisionsDialog,
			data: {
				teamspace: activeTeamspace,
				modelId: model
			}
		});
	}

	public handleDelete = () => {
		event.stopPropagation();

		const { activeTeamspace, showConfirmDialog, name, model, projectName, removeModel } = this.props;
		const type = this.isFederation ? 'federation' : 'model';

		showConfirmDialog({
			title: `Delete ${type}`,
			content: `
				Do you really want to delete ${type} <b>${name}</b>? <br /><br />
				Your data will be lost permanently and will not be recoverable.
			`,
			onConfirm: () => {
				removeModel(activeTeamspace, {
					id: model, name, project: projectName
				});
			}
		});
	}

	public handleClick = () => {
		event.stopPropagation();
		const { history, activeTeamspace, timestamp, model } = this.props;
		if (timestamp) {
			history.push(`${ROUTES.VIEWER}/${activeTeamspace}/${model}`);
			analyticsService.sendEvent(EVENT_CATEGORIES.MODEL, EVENT_ACTIONS.VIEW);
		} else {
			// this.openUploadModelFileDialog(activeTeamspace, props)(event);
		}
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

	public createHoverHandler = memoizeOne((hovered) => () => {
		this.setState({ hovered });
	});

	public renderPendingStatus = (status) => (
		<Status>
			<Loader content={`${startCase(status)}...`} size={20} horizontal />
		</Status>
	)

	public toggleActionsMenuOpen = (event) => {
		event.stopPropagation();
		this.setState({actionsMenuOpen: !this.state.actionsMenuOpen});
	}

	public render() {
		const { name, subModels, timestamp, status } = this.props;
		const { hovered, actionsMenuOpen } = this.state;
		const isFederation = Boolean(subModels);
		const actions = isFederation ? this.federationActions : this.modelActions;
		const isPending = isPendingStatus(status);
		const showLink = !!timestamp;

		return(
				<Container onMouseEnter={this.createHoverHandler(true)} onMouseLeave={this.createHoverHandler(false)}>
					<Grid container direction="row" alignItems="center" justify="space-between" wrap="nowrap">
						<Grid container justify="space-between" wrap="nowrap" alignItems="center">
							{ isPending
								? ( showLink
									? <><LinkedName onClick={this.handleClick}>{name}</LinkedName> {this.renderPendingStatus(status)}</>
									: <><Name>{name}</Name>{this.renderPendingStatus(status)}</>)
								: <LinkedName onClick={this.handleClick}>{name}</LinkedName>
							}
						</Grid>
						<TimeWrapper
							container
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

/**
 *  Copyright (C) 2019 3D Repo Ltd
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

import React, { useEffect } from 'react';
import { ROUTES } from '../../../../constants/routes';
import { hasPermissions } from '../../../../helpers/permissions';
import { renderWhenTrue } from '../../../../helpers/rendering';
import { analyticsService, EVENT_ACTIONS, EVENT_CATEGORIES } from '../../../../services/analytics';
import { COLOR } from '../../../../styles';
import { SmallIconButton } from '../../../components/smallIconButon/smallIconButton.component';
import { StarIcon } from '../../../components/starIcon/starIcon.component';
import { PERMISSIONS_VIEWS } from '../../../projects/projects.component';
import { ROW_ACTIONS } from '../../teamspaces.contants';
import { ActionsMenu } from '../actionsMenu/actionsMenu.component';
import FederationDialog from '../federationDialog/federationDialog.container';
import { RevisionsDialog } from '../revisionsDialog/revisionsDialog.component';
import UploadModelFileDialog from '../uploadModelFileDialog/uploadModelFileDialog.container';
import {
	Actions,
	ClickableLayer,
	Container, Content,
	Header, Name, NameWrapper,
	PropertiesColumn,
	Property,
	Timestamp
} from './modelGridItem.styles';

interface IProps {
	activeTeamspace: string;
	className?: string;
	history: any;
	teamspace: string;
	name: string;
	model: string;
	permissions: any[];
	project: string;
	status: string;
	timestamp: string;
	federate: boolean;
	canUpload: boolean;
	showDialog: (config) => void;
	showConfirmDialog: (config) => void;
	updateModel: (teamspace, modelName, modelData) => void;
	removeModel: (teamspace, modelData) => void;
	downloadModel: (teamspace, modelId) => void;
	onShareClick: () => void;
	onModelUpload: () => void;
	onRevisionsClick: () => void;
	subscribeOnStatusChange: (teamspace, projectName, modelData) => void;
	unsubscribeOnStatusChange: (teamspace, projectName, modelData) => void;
}

export function ModelGridItem(props: IProps) {
	const isFederation = Boolean(props.federate);
	const isPending = false;

	const renderActions = (actions) => {
		return actions ? actions.map((actionItem, index) => {
			const {label, action, Icon, color, isHidden = false, requiredPermissions = ''} = actionItem;
			const iconProps = {color, fontSize: 'small'} as any;
			const ActionsIconButton = () => (<Icon {...iconProps} />);

			if (!isHidden) {
				return renderWhenTrue((
					<SmallIconButton
						key={label}
						aria-label={label}
						onClick={action}
						Icon={ActionsIconButton}
						tooltip={label}
					/>
				))(hasPermissions(requiredPermissions, props.permissions));
			}
		}) : null;
	};

	const handlePermissionsClick = (event) => {
		event.stopPropagation();
		const { history, project, teamspace, model } = props;
		history.push({
			pathname: `${ROUTES.USER_MANAGEMENT_MAIN}/${teamspace}/projects`,
			search: `?project=${project}&modelId=${model}&view=${PERMISSIONS_VIEWS.MODELS}`
		});
	};

	const handleSettingsClick = () => {
		event.stopPropagation();
		const { history, project, teamspace, model } = props;
		history.push({
			pathname: `${ROUTES.MODEL_SETTINGS}/${teamspace}/models/${model}`,
			search: `?project=${project}`
		});
	};

	const handleDownloadClick = () => {
		props.downloadModel(props.teamspace, props.model);
	};

	const handleRevisionsClick = () => {
		event.stopPropagation();
		const { teamspace, model, name } = props;

		props.showDialog({
			title: `${name} - Revisions`,
			template: RevisionsDialog,
			data: {
				teamspace,
				modelId: model
			}
		});
	};

	const handleShare = (event) => {
		event.stopPropagation();
		console.log('Share model', props);
	};

	const handleDelete = () => {
		event.stopPropagation();

		const { teamspace, showConfirmDialog, name, model, project, removeModel } = props;
		const type = isFederation ? 'federation' : 'model';

		showConfirmDialog({
			title: `Delete ${type}`,
			content: `
				Do you really want to delete ${type} <b>${name}</b>? <br /><br />
				Your data will be lost permanently and will not be recoverable.
			`,
			onConfirm: () => {
				removeModel(teamspace, { id: model, name, project });
			}
		});
	};

	const handleClick = () => {
		event.stopPropagation();
		const { history, teamspace, timestamp, model } = props;
		if (timestamp) {
			history.push(`${ROUTES.VIEWER}/${teamspace}/${model}`);
			analyticsService.sendEvent(EVENT_CATEGORIES.MODEL, EVENT_ACTIONS.VIEW);
		} else {
			handleUploadModelFile(event);
		}
	};

	const handleUploadModelFile = (event) => {
		event.stopPropagation();
		const { teamspace, name, model, canUpload, project } = props;

		props.showDialog({
			title: `Upload Model`,
			template: UploadModelFileDialog,
			data: {
				teamspaceName: teamspace,
				modelName: name,
				modelId: model,
				canUpload,
				project
			}
		});
	};

	const handleFederationEdit = (event) => {
		event.stopPropagation();
		const { teamspace, model, name, project } = props;
		debugger;

		props.showDialog({
			title: 'Edit federation',
			template: FederationDialog,
			data: {
				name,
				modelName: name,
				teamspace,
				project,
				editMode: !!name,
				modelId: model
			}
		});
	};

	const handleStarClick = () => {
		console.log('star click');
	};

	const sharedActions = [{
		...ROW_ACTIONS.PERMISSIONS,
		action: handlePermissionsClick
	}, {
		...ROW_ACTIONS.SHARE,
		action: handleShare
	}, {
		...ROW_ACTIONS.SETTINGS,
		action: handleSettingsClick
	}, {
		...ROW_ACTIONS.DELETE,
		action: handleDelete
	}];

	const modelActions = [{
		...ROW_ACTIONS.UPLOAD_FILE,
		action: handleUploadModelFile
	}, {
		...ROW_ACTIONS.REVISIONS,
		action: handleRevisionsClick
	}, {
		...ROW_ACTIONS.DOWNLOAD,
		action: handleDownloadClick,
		isHidden: !Boolean(props.timestamp)
	}, ...sharedActions];

	const federationActions = [{
		...ROW_ACTIONS.EDIT,
		action: handleFederationEdit
	}, ...sharedActions];

	const rowActions = isFederation ? federationActions : modelActions;

	useEffect(() => {
			if (!isFederation) {
				const modelData = { modelId: props.model, modelName: props.name };
				props.subscribeOnStatusChange(props.teamspace, props.projectName, modelData);
				return () => props.unsubscribeOnStatusChange(props.teamspace, props.projectName, modelData);
			}
	}, []);

	return (
		<Container
			federate={isFederation}
			className={props.className}
		>
			<ClickableLayer onClick={handleClick} />
			<Header>
				<NameWrapper>
					<StarIcon
						active={isFederation}
						activeColor={COLOR.SUNGLOW}
						onClick={handleStarClick}
					/>
					<Name>{props.name}</Name>
				</NameWrapper>
				<ActionsMenu disabled={isPending} federate={isFederation}>
					<Actions>
						{renderActions(rowActions)}
					</Actions>
				</ActionsMenu>
			</Header>
			<Content>
				<PropertiesColumn>
					<Property>MC1</Property> {/* TODO: Model code */}
					<Property>SC1</Property> {/* TODO: Suitability code */}
				</PropertiesColumn>
				<Timestamp>30/09/2019 16:30</Timestamp> {/* TODO: Last updated */}
			</Content>
		</Container>
	);
}

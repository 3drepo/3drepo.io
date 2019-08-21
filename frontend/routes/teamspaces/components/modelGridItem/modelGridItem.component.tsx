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

import copy from 'copy-to-clipboard';
import { pick, startCase } from 'lodash';
import React, { useEffect, useRef, useState } from 'react';
import { ROUTES } from '../../../../constants/routes';
import { hasPermissions } from '../../../../helpers/permissions';
import { renderWhenTrue } from '../../../../helpers/rendering';
import { analyticsService, EVENT_ACTIONS, EVENT_CATEGORIES } from '../../../../services/analytics';
import { formatDate, LONG_DATE_TIME_FORMAT } from '../../../../services/formatting/formatDate';
import { TYPES } from '../../../components/dialogContainer/components/revisionsDialog/revisionsDialog.constants';
import { Loader } from '../../../components/loader/loader.component';
import { SmallIconButton } from '../../../components/smallIconButon/smallIconButton.component';
import { StarIcon } from '../../../components/starIcon/starIcon.component';
import { PERMISSIONS_VIEWS } from '../../../projects/projects.component';
import { ROW_ACTIONS } from '../../teamspaces.contants';
import { ActionsMenu } from '../actionsMenu/actionsMenu.component';
import FederationDialog from '../federationDialog/federationDialog.container';
import UploadModelFileDialog from '../uploadModelFileDialog/uploadModelFileDialog.container';
import {
	Actions,
	Container, Content,
	Header, Name, NameWrapper,
	PropertiesColumn,
	Property,
	Status,
	Timestamp
} from './modelGridItem.styles';

interface IProps {
	className?: string;
	history: any;
	teamspace: string;
	name: string;
	model: string;
	permissions: any[];
	projectName: string;
	project: string;
	status: string;
	timestamp: string;
	federate: boolean;
	canUpload: boolean;
	code?: string;
	suitabilityCode?: string;
	isStarred: boolean;
	showDialog: (config) => void;
	showConfirmDialog: (config) => void;
	showRevisionsDialog: (config) => void;
	removeModel: (teamspace, modelData) => void;
	downloadModel: (teamspace, modelId) => void;
	onShareClick: () => void;
	subscribeOnStatusChange: (teamspace, projectName, modelData) => void;
	unsubscribeOnStatusChange: (teamspace, projectName, modelData) => void;
	showSnackbar: (text) => void;
	addToStarred: (modelName) => void;
	removeFromStarred: (modelName) => void;
}

export function ModelGridItem(props: IProps) {
	const isFederation = Boolean(props.federate);
	const isPendingStatus = () =>
		props.status && props.status === 'uploading' || props.status === 'queued' || props.status === 'processing';
	const isPending = isPendingStatus();

	const [hasDelayedClick, setHasDelayedClick] = useState(false);
	const starClickTimeout = useRef(null);

	useEffect(() => {
		if (!isFederation) {
			const modelData = { modelId: props.model, modelName: props.name };
			props.subscribeOnStatusChange(props.teamspace, props.projectName, modelData);
			return () => props.unsubscribeOnStatusChange(props.teamspace, props.projectName, modelData);
		}
	}, [props.teamspace, props.projectName, props.model, props.name]);

	const resetStarClickTimeout = () => {
		setHasDelayedClick(false);
		clearTimeout(starClickTimeout.current);
		starClickTimeout.current = null;
	};

	useEffect(resetStarClickTimeout, [props.isStarred]);

	const handlePermissionsClick = (event) => {
		event.stopPropagation();
		const { history, projectName, teamspace, model } = props;
		history.push({
			pathname: `${ROUTES.USER_MANAGEMENT_MAIN}/${teamspace}/projects`,
			search: `?project=${projectName}&modelId=${model}&view=${PERMISSIONS_VIEWS.MODELS}`
		});
	};

	const handleSettingsClick = () => {
		event.stopPropagation();
		const { history, projectName, teamspace, model } = props;
		history.push({
			pathname: `${ROUTES.TEAMSPACES}/${teamspace}/models/${model}`,
			search: `?project=${projectName}`
		});
	};

	const handleDownloadClick = () => {
		props.downloadModel(props.teamspace, props.model);
	};

	const handleRevisionsClick = () => {
		const { teamspace, model, name } = props;
		props.showRevisionsDialog({
			title: `Revisions: ${name}`,
			data: {
				currentModelName: name,
				teamspace,
				modelId: model,
				type: TYPES.TEAMSPACES
			}
		});
	};

	const handleShare = () => {
		const url = `${location.hostname}${ROUTES.VIEWER}/${props.teamspace}/${props.model}`;
		copy(url);
		props.showSnackbar('Share link copied to clipboard');
	};

	const handleDelete = () => {
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
		const { history, teamspace, timestamp, model } = props;
		if (timestamp) {
			history.push(`${ROUTES.VIEWER}/${teamspace}/${model}`);
			analyticsService.sendEvent(EVENT_CATEGORIES.MODEL, EVENT_ACTIONS.VIEW);
		} else {
			handleUploadModelFile();
		}
	};

	const handleUploadModelFile = () => {
		const { teamspace, name, model, canUpload, projectName } = props;

		props.showDialog({
			title: `Upload Model`,
			template: UploadModelFileDialog,
			DialogProps: {
				disableRestoreFocus: true
			},
			data: {
				teamspaceName: teamspace,
				modelName: name,
				modelId: model,
				canUpload,
				project: projectName
			}
		});
	};

	const handleFederationEdit = () => {
		const { teamspace, model, name, project } = props;

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
		if (starClickTimeout.current) {
			resetStarClickTimeout();
		} else {
			setHasDelayedClick(true);
			starClickTimeout.current = setTimeout(() => {
				const modelData = pick(props, ['model', 'name', 'teamspace']);

				if (props.isStarred) {
					props.removeFromStarred(modelData);
				} else {
					props.addToStarred(modelData);
				}
			}, 2000);
		}
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

	const renderModelCode = renderWhenTrue(<Property>{props.code}</Property>);

	const renderSuitabilityCode = renderWhenTrue(<Property>{props.suitabilityCode}</Property>);

	const renderTimestamp = renderWhenTrue(<Timestamp>{formatDate(props.timestamp, LONG_DATE_TIME_FORMAT)}</Timestamp>);

	const renderPendingStatus = renderWhenTrue(
		<Status>
			<Loader content={`${startCase(props.status)}...`} size={20} horizontal />
		</Status>
	);

	const renderActions = (actions) => {
		if (!actions) {
			return null;
		}
		return actions.map((actionItem) => {
			const { label, action, Icon, color, isHidden = false, requiredPermissions = '' } = actionItem;
			const iconProps = { fontSize: 'small' } as any;
			const disabled = isPending && [ROW_ACTIONS.UPLOAD_FILE.label, ROW_ACTIONS.DELETE.label].includes(label);
			if (!disabled) {
				iconProps.color = color;
			}
			const ActionsIconButton = () => (<Icon {...iconProps} />);

			if (!isHidden) {
				return renderWhenTrue((
					<SmallIconButton
						key={label}
						aria-label={label}
						onClick={action}
						Icon={ActionsIconButton}
						tooltip={label}
						disabled={disabled}
					/>
				))(hasPermissions(requiredPermissions, props.permissions));
			}
		});
	};

	const renderActionsMenu = () => (
		<ActionsMenu federate={isFederation}>
			<Actions>
				{renderActions(rowActions)}
			</Actions>
		</ActionsMenu>
	);

	return (
		<Container federate={isFederation} className={props.className}>
			<Header>
				<NameWrapper>
					<StarIcon
						active={hasDelayedClick ? !props.isStarred : props.isStarred}
						onClick={handleStarClick}
					/>
					<Name lines={2} onClick={handleClick}>{props.name}</Name>
				</NameWrapper>
				{renderActionsMenu()}
			</Header>
			<Content>
				<PropertiesColumn>
					{renderModelCode(props.code)}
					{renderSuitabilityCode(props.suitabilityCode)}
				</PropertiesColumn>
				{renderTimestamp(!isPending && props.timestamp)}
				{renderPendingStatus(isPending)}
			</Content>
		</Container>
	);
}

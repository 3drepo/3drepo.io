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
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ROUTES } from '../../../../constants/routes';
import { renderWhenTrue } from '../../../../helpers/rendering';
import { IViewpointsComponentState } from '../../../../modules/viewpoints/viewpoints.redux';
import { formatDate, LONG_DATE_TIME_FORMAT } from '../../../../services/formatting/formatDate';
import { TYPES } from '../../../components/dialogContainer/components/revisionsDialog/revisionsDialog.constants';
import { Loader } from '../../../components/loader/loader.component';
import ViewsDialog from '../../../components/viewsDialog/viewsDialog.container';
import { PERMISSIONS_VIEWS } from '../../../projects/projects.component';
import { ROW_ACTIONS } from '../../teamspaces.contants';
import { ActionsMenu } from '../actionsMenu/actionsMenu.component';
import FederationDialog from '../federationDialog/federationDialog.container';
import UploadModelFileDialog from '../uploadModelFileDialog/uploadModelFileDialog.container';
import {
	Container,
	Content,
	Header,
	ModelCode,
	ModelLink,
	Name,
	NameWithCode,
	NameWrapper,
	PropertiesColumn,
	Property,
	RevisionsNumber,
	StarIcon,
	Status,
	Timestamp
} from './modelGridItem.styles';

interface IProps {
	history: any;
	teamspace: string;
	name: string;
	query?: string;
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
	nRevisions?: number;
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
	setState: (componentState: IViewpointsComponentState) => void;
	searchEnabled?: boolean;
	shareViewpointLink: (teamspace, modelId, viewId) => void;
}

export const ModelGridItem = memo((props: IProps) => {
	const isFederation = Boolean(props.federate);
	const isPending = !(!props.status || props.status === 'ok'
		|| props.status === 'failed' || props.status === 'uploaded');

	const [hasDelayedClick, setHasDelayedClick] = useState(false);
	const starClickTimeout = useRef(null);

	useEffect(() => {
		if (!isFederation) {
			const modelData = { modelId: props.model, modelName: props.name };
			props.subscribeOnStatusChange(props.teamspace, props.projectName, modelData);
			return () => props.unsubscribeOnStatusChange(props.teamspace, props.projectName, modelData);
		}
	}, []);

	useEffect(() => {
		return () => handleCloseSearchMode();
	}, []);

	const resetStarClickTimeout = () => {
		setHasDelayedClick(false);
		clearTimeout(starClickTimeout.current);
		starClickTimeout.current = null;
	};

	useEffect(resetStarClickTimeout, [props.isStarred]);

	const handleGoToBoard = (event) => {
		event.stopPropagation();
		const { history, projectName, teamspace, model } = props;
		history.push({
			pathname: `${ROUTES.BOARD_MAIN}/issues/${teamspace}/${projectName}/${model}`
		});
	};

	const handlePermissionsClick = (event) => {
		event.stopPropagation();
		const { history, projectName, teamspace, model } = props;
		history.push({
			pathname: `${ROUTES.USER_MANAGEMENT_MAIN}/${teamspace}/projects`,
			search: `?project=${encodeURIComponent(projectName)}&modelId=${model}&view=${PERMISSIONS_VIEWS.MODELS}`
		});
	};

	const handleSettingsClick = () => {
		event.stopPropagation();
		const { history, projectName, teamspace, model } = props;
		history.push({
			pathname: `${ROUTES.TEAMSPACES}/${teamspace}/models/${model}`,
			search: `?project=${encodeURIComponent(projectName)}`
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

	const handleOpenSearchMode = () => props.setState({ searchEnabled: true });

	const handleCloseSearchMode = () =>
		props.setState({
			searchEnabled: false,
			searchQuery: ''
		});

	const onChange = ({ target }) => {
		const { teamspace, model } = props;
		props.history.push(`${ROUTES.VIEWER}/${teamspace}/${model}?viewId=${target.value.id}`);
	};

	const handleLoadModelClick = () => {
		const { teamspace, model, shareViewpointLink } = props;

		props.showDialog({
			title: 'Load model with...',
			template: ViewsDialog,
			data: {
				teamspace,
				modelId: model,
				onChange,
				onShare: shareViewpointLink,
			},
			search: {
				enabled: props.searchEnabled,
				onOpen: handleOpenSearchMode,
				onClose: handleCloseSearchMode,
			},
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

	const handleClick = useCallback((e) => {
		const { history, teamspace, timestamp, nRevisions, model } = props;
		if (timestamp || nRevisions > 0 ) {
			history.push(`${ROUTES.VIEWER}/${teamspace}/${model}`);
		} else {
			handleUploadModelFile();
		}
	}, [props.history, props.teamspace, props.timestamp, props.model]);

	const handleUploadModelFile = () => {
		const { teamspace, name, model, canUpload, projectName } = props;

		props.showDialog({
			title: `New Revision: ${name}`,
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

	const handleFederationEdit = useCallback(() => {
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
	}, [props.teamspace, props.model, props.name, props.project]);

	const handleStarClick = useCallback(() => {
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
	}, [starClickTimeout.current, props.isStarred, props.model]);

	const getRowActions = () => {
		const sharedBeginningActions = [{
			...ROW_ACTIONS.LOAD_MODEL,
			onClick: handleLoadModelClick
		}];

		const sharedActions = [{
			...ROW_ACTIONS.PERMISSIONS,
			onClick: handlePermissionsClick
		}, {
			...ROW_ACTIONS.SHARE,
			onClick: handleShare
		}, {
			...ROW_ACTIONS.SETTINGS,
			onClick: handleSettingsClick
		}, {
			...ROW_ACTIONS.DELETE,
			onClick: handleDelete
		}];

		if (isFederation) {
			return [
				...sharedBeginningActions,
			{
				...ROW_ACTIONS.EDIT,
				onClick: handleFederationEdit
			}, {
				...ROW_ACTIONS.BOARD,
				onClick: handleGoToBoard
			},
				...sharedActions];
		}

		return [
			...sharedBeginningActions,
		{
			...ROW_ACTIONS.UPLOAD_FILE,
			onClick: handleUploadModelFile
		}, {
			...ROW_ACTIONS.BOARD,
			onClick: handleGoToBoard
		}, {
			...ROW_ACTIONS.REVISIONS,
			onClick: handleRevisionsClick
		}, {
			...ROW_ACTIONS.DOWNLOAD,
			onClick: handleDownloadClick,
			isHidden: !Boolean(props.timestamp)
		}, ...sharedActions];
	};

	const rowActions = useMemo(getRowActions, [isFederation]);

	const renderModelCode = renderWhenTrue(<ModelCode><Property>{props.code}</Property></ModelCode>);

	const renderRevisionsNumber = renderWhenTrue(
		<RevisionsNumber onClick={handleRevisionsClick}>
			{`${props.nRevisions || 0} ${props.nRevisions === 1 ? 'revision' : 'revisions'}`}
		</RevisionsNumber>
	);

	const renderSuitabilityCode = renderWhenTrue(<Property>{props.suitabilityCode}</Property>);

	const renderTimestamp = renderWhenTrue(<Timestamp>{formatDate(props.timestamp, LONG_DATE_TIME_FORMAT)}</Timestamp>);

	const renderPendingStatus = renderWhenTrue(
		<Status>
			<Loader content={`${startCase(props.status)}...`} size={20} horizontal />
		</Status>
	);

	return (
		<Container federate={isFederation}>
			<ModelLink onClick={handleClick} isPending={isPending} />
			<Header>
				<NameWrapper>
					<StarIcon
						active={hasDelayedClick ? !props.isStarred : props.isStarred}
						onClick={handleStarClick}
					/>
					<NameWithCode onClick={handleClick}>
						<Name
							onClick={handleClick}
							isPending={isPending}
							search={props.query}
							text={props.name}
							splitQueryToWords
						/>
						{renderModelCode(props.code)}
					</NameWithCode>
				</NameWrapper>
				<ActionsMenu
					federate={isFederation}
					actions={rowActions}
					permissions={props.permissions}
					isPending={isPending}
				/>
			</Header>
			<Content>
				<PropertiesColumn>
					{renderRevisionsNumber(!isFederation)}
					{renderSuitabilityCode(props.suitabilityCode)}
				</PropertiesColumn>
				{renderTimestamp(!isPending && props.timestamp)}
				{renderPendingStatus(isPending)}
			</Content>
		</Container>
	);
});

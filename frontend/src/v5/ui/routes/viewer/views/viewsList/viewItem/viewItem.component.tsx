/**
 *  Copyright (C) 2026 3D Repo Ltd
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

import { SyntheticEvent, useContext } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Tooltip } from '@mui/material';
import { useParams } from 'react-router-dom';

import ShareIcon from '@mui/icons-material/Share';
import CancelIcon from '@assets/icons/controls/clear_circle.svg';
import EditIcon from '@assets/icons/outlined/edit_comment-outlined.svg';
import { Highlight } from '@controls/highlight';
import { ViewerParams } from '@/v5/ui/routes/routes.constants';
import { modelIsFederation } from '@/v5/store/tickets/tickets.helpers';
import { ContainersHooksSelectors, FederationsHooksSelectors, ModelHooksSelectors, ProjectsHooksSelectors } from '@/v5/services/selectorsHooks';
import { ViewpointsActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { CalibrationContext } from '@/v5/ui/routes/dashboard/projects/calibration/calibrationContext';
import {
	IconsGroup,
	NameRow,
	NewViewpointName,
	StyledForm,
	ViewpointItem,
	SaveButton,
	IconButton,
	ViewpointName,
	Subtitle,
	ViewThumbnail,
} from './viewItem.styles';
import { FormattedMessage } from 'react-intl';
import { EllipsisMenu } from '@controls/ellipsisMenu';
import { EllipsisMenuItem } from '@controls/ellipsisMenu/ellipsisMenuItem';
import { formatMessage } from '@/v5/services/intl';
import { SearchContext } from '@controls/search/searchContext';
import { ViewItemSchema } from '@/v5/validation/viewpointSchemes/viewpointSchemes';
import { IViewpoint } from '@/v5/store/viewpoints/viewpoints.types';
import { getScreenshotFromView } from '@/v5/helpers/viewpoint.helpers';

interface IViewItem {
	viewpoint: IViewpoint;
	active?: boolean;
	editMode?: boolean;
	setActiveViewpoint: (viewpoint: IViewpoint | null) => void;
	setEditMode: (mode: boolean) => void;
	createMode: boolean;
	setCreateMode: (mode: boolean) => void;
}

const ViewpointNameLabel = ({ name, defaultView }) => {
	const { query } = useContext(SearchContext);
	return (
		<Tooltip title={name} placement="bottom">
			<ViewpointName>
				<Highlight search={query}>{name}</Highlight>
				{defaultView && (
					<Subtitle>
						<FormattedMessage id="viewsCard.viewItem.homeView" defaultMessage="(Home View)" />
					</Subtitle>
				)}
			</ViewpointName>
		</Tooltip>
	);
};

const ViewEllipsisMenu = ({ onSetAsDefault, onDelete, isAdmin, defaultView }) => (
	<EllipsisMenu>
		<EllipsisMenuItem
			title={formatMessage({
				id: 'views.viewItem.ellipsisMenu.unsetAsHomeView',
				defaultMessage: 'Unset as Home View',
			})}
			onClick={onSetAsDefault}
			hidden={!defaultView}
			disabled={!isAdmin}
		/>
		<EllipsisMenuItem
			title={formatMessage({
				id: 'views.viewItem.ellipsisMenu.setAsHomeView',
				defaultMessage: 'Set as Home View',
			})}
			onClick={onSetAsDefault}
			hidden={defaultView}
			disabled={!isAdmin}
		/>
		<EllipsisMenuItem
			title={formatMessage({
				id: 'views.viewItem.ellipsisMenu.delete',
				defaultMessage: 'Delete',
			})}
			onClick={onDelete}
			hidden={defaultView}
		/>
	</EllipsisMenu>
);

export const ViewItem = ({ viewpoint, active, editMode, setActiveViewpoint, setEditMode, createMode, setCreateMode }: IViewItem) => {
	const { teamspace, containerOrFederation, project, revision } = useParams<ViewerParams>();
	const isFederation = modelIsFederation(containerOrFederation);
	const isCommenter = isFederation
		? FederationsHooksSelectors.selectHasCommenterAccess(containerOrFederation)
		: ContainersHooksSelectors.selectHasCommenterAccess(containerOrFederation);
	const isAdmin = ProjectsHooksSelectors.selectIsProjectAdmin();
	const defaultViewSetting = ModelHooksSelectors.selectDefaultView();
	const defaultView = defaultViewSetting ? viewpoint._id === defaultViewSetting.id : false;
	const { isCalibrating, step: calibrationStep } = useContext(CalibrationContext);

	const screenshot = getScreenshotFromView(viewpoint);

	const handleDelete = (e) => {
		e.persist();
		ViewpointsActionsDispatchers.deleteViewpoint(teamspace, containerOrFederation, viewpoint._id);
	};

	const onClickCancelEdit = (e: SyntheticEvent) => {
		e.stopPropagation();
		setEditMode(false);
		setCreateMode(false);
	};

	const handleShareLink = (e: SyntheticEvent) => {
		e.stopPropagation();
		ViewpointsActionsDispatchers.shareViewpointLink(teamspace, containerOrFederation, viewpoint._id, project, revision);
	};

	const handleSetDefault = () => {
		if (!defaultView) {
			ViewpointsActionsDispatchers.setDefaultViewpoint(teamspace, containerOrFederation, viewpoint);
		} else {
			ViewpointsActionsDispatchers.clearDefaultViewpoint(teamspace, containerOrFederation);
		}
	};

	const onClickItem = () => {
		if (!editMode && !createMode) {
			const vp = { ...viewpoint };
			if (isCalibrating && calibrationStep === 2) {
				delete vp.viewpoint?.clippingPlanes;
				delete vp.clippingPlanes;
			}
			setActiveViewpoint(vp);
			ViewpointsActionsDispatchers.showViewpoint(teamspace, containerOrFederation, vp);
		}
	};

	const { register, handleSubmit, formState: { errors } } = useForm({
		mode: 'onChange',
		defaultValues: { name: viewpoint._id ? viewpoint.name : '' },
		resolver: yupResolver(ViewItemSchema),
	});

	const onSubmit = (values) => {
		const newName = values.name || viewpoint.name;
		if (createMode) {
			const newViewpoint = { ...viewpoint, name: newName };
			ViewpointsActionsDispatchers.createViewpoint(teamspace, containerOrFederation, newViewpoint);
			setCreateMode(false);
		} else {
			ViewpointsActionsDispatchers.updateViewpointName(teamspace, containerOrFederation, viewpoint._id, newName);
			setEditMode(false);
		}
	};

	return (
		<ViewpointItem onClick={onClickItem} active={!!active}>
			<ViewThumbnail src={screenshot} alt={viewpoint.name} />
			{active && editMode && (
				<StyledForm onSubmit={handleSubmit(onSubmit)}>
					<NewViewpointName
						{...register('name')}
						fullWidth
						error={Boolean(errors.name)}
						helperText={errors.name?.message}
						label={formatMessage({ id: 'views.viewItem.nameFieldLabel', defaultMessage: 'View name' })}
						placeholder={viewpoint.name}
						autoFocus
						onKeyDown={(e) => e.stopPropagation()}
					/>
					<IconsGroup>
						<IconButton onClick={onClickCancelEdit}>
							<CancelIcon />
						</IconButton>
						<SaveButton disabled={Boolean(errors.name)} type="submit">{formatMessage({ id: 'views.viewItem.saveButton', defaultMessage: 'Save' })}</SaveButton>
					</IconsGroup>
				</StyledForm>
			)}
			{!(active && editMode) && (
				<NameRow>
					<ViewpointNameLabel name={viewpoint.name} defaultView={defaultView} />
					{active && (
						<IconsGroup>
							{isCommenter && (
								<IconButton onClick={() => setEditMode(true)}>
									<EditIcon />
								</IconButton>
							)}
							<IconButton onClick={handleShareLink}>
								<ShareIcon />
							</IconButton>
							{isCommenter && (
								<ViewEllipsisMenu onSetAsDefault={handleSetDefault} onDelete={handleDelete} isAdmin={isAdmin} defaultView={defaultView} />
							)}
						</IconsGroup>
					)}
				</NameRow>
			)}
		</ViewpointItem>
	);
};

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

import { SyntheticEvent, useRef, useState, useContext } from 'react';
import { debounce } from 'lodash';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Tooltip } from '@mui/material';
import { useParams } from 'react-router-dom';

import ShareIcon from '@mui/icons-material/Share';
import CancelIcon from '@assets/icons/controls/clear_circle.svg';
import EditIcon from '@assets/icons/outlined/edit_comment-outlined.svg';
import { Highlight } from '@controls/highlight';
import { getViewNameFieldErrorMsg } from '@/v4/helpers/views';
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

interface IViewItem {
	viewpoint: any; // TODO
	active?: boolean;
	editMode?: boolean;
	setActiveViewpoint: (viewpoint: any | null) => void;
	setEditMode: (mode: boolean) => void;
	createMode: boolean;
	setCreateMode: (mode: boolean) => void;
}

const ViewItemSchema = Yup.object().shape({ // TODO move to validators
	name: Yup.string().max(37),
});

const ViewpointNameLabel = ({ name, defaultView, active = false }) => {
	const { query } = useContext(SearchContext);
	return (
		<Tooltip title={name} placement="bottom">
			<ViewpointName active={active}>
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

const getScreenshot = (viewpoint: any): string | null => {
	const screenshot = viewpoint?.screenshot || viewpoint?.viewpoint?.screenshot;
	if (!screenshot) return null;
	if (screenshot.thumbnailUrl) return screenshot.thumbnailUrl;
	if (!screenshot.startsWith('data:image/png;base64,') && !screenshot.startsWith('https://')) {
		return 'data:image/png;base64,' + screenshot;
	}
	return screenshot;
};

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

	const [isDeletePending, setIsDeletePending] = useState(false);

	const screenshot = getScreenshot(viewpoint);

	const debouncedDelete = useRef(debounce((e) => {
		if (!isDeletePending) {
			e.stopPropagation();
			setIsDeletePending(true);
			ViewpointsActionsDispatchers.deleteViewpoint(teamspace, containerOrFederation, viewpoint._id);
		}
	}, 150, { leading: true })).current;

	const handleDelete = (e) => {
		e.persist();
		// debouncedDelete(e);
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

	const formik = useFormik({
		initialValues: { name: viewpoint._id ? viewpoint.name : '' },
		validationSchema: ViewItemSchema,
		onSubmit: (values) => {
			const newName = values.name || viewpoint.name;
			if (createMode) {
				const newViewpoint = { ...viewpoint, name: newName };
				ViewpointsActionsDispatchers.createViewpoint(teamspace, containerOrFederation, newViewpoint);
				setCreateMode(false);
			} else {
				ViewpointsActionsDispatchers.updateViewpoint(teamspace, containerOrFederation, viewpoint._id, newName);
				setEditMode(false);
			}
		},
		enableReinitialize: true,
	});

	return (
		<ViewpointItem
			disabled={viewpoint.willBeRemoved}
			onClick={onClickItem}
			active={!!active}
		>
			{viewpoint.willBeRemoved && <span>This view has been deleted</span>}
			<ViewThumbnail src={screenshot} alt={viewpoint.name} />
			{active && editMode && (
				<StyledForm onSubmit={formik.handleSubmit}>
					<NewViewpointName
						name="name"
						value={formik.values.name}
						onChange={formik.handleChange}
						fullWidth
						error={Boolean(formik.errors.name)}
						helperText={getViewNameFieldErrorMsg(formik.errors.name)}
						label={formatMessage({ id: 'views.viewItem.nameFieldLabel', defaultMessage: 'View name' })}
						placeholder={viewpoint.name}
						autoFocus
						onKeyDown={(e) => e.stopPropagation()}
					/>
					<IconsGroup disabled={isDeletePending}>
						<IconButton onClick={onClickCancelEdit}>
							<CancelIcon />
						</IconButton>
						<SaveButton type="submit" id="views-card-save-button">{formatMessage({ id: 'views.viewItem.saveButton', defaultMessage: 'Save' })}</SaveButton>
					</IconsGroup>
				</StyledForm>
			)}
			{!(active && editMode) && (
				<NameRow>
					<ViewpointNameLabel name={viewpoint.name} defaultView={defaultView} active />
					{active && (
						<IconsGroup disabled={isDeletePending}>
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

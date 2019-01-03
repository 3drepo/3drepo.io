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
import { Formik, Field } from 'formik';

import { renderWhenTrue } from '../../../../../../helpers/rendering';

import {
	ViewpointItem,
	StyledForm,
	Thumbnail,
	ThumbnailPlaceholder,
	IconsGroup,
	StyledDeleteIcon,
	StyledEditIcon,
	StyledCancelIcon,
	NewViewpointName,
	Name,
	NameRow,
	SaveIconButton,
	StyledSaveIcon
} from './viewItem.styles';

interface IProps {
	viewpoint: any;
	handleClick: (viewpoint) => void;
	updateViewpoint: (teamspace, modelId, viewpointId, newName) => void;
	deleteViewpoint: (teamspace, modelId, viewpointId) => void;
	onCancelEditMode: () => void;
	onOpenEditMode: () => void;
	active: boolean;
	editMode: boolean;
	teamspace: string;
	modelId: string;
}

export class ViewItem extends React.PureComponent<IProps, any> {
	public renderScreenshotPlaceholder = renderWhenTrue(() => <ThumbnailPlaceholder />);

	public renderScreenshot = (viewpoint) => renderWhenTrue(() => (
		<Thumbnail src={viewpoint.screenshot.thumbnailUrl} alt={viewpoint.name} />
	))(viewpoint.screenshot.thumbnailUrl)

	public renderViewpointForm = (viewpoint) => renderWhenTrue(() => {
		return (
			<Formik
				initialValues={{ newName: viewpoint.name }}
				onSubmit={this.handleSaveEdit(viewpoint._id)}>
				<StyledForm>
					<Field name="newName" render={({ field, form }) => (
						<NewViewpointName
							{...field}
							error={Boolean(form.errors.name)}
							helperText={form.errors.name}
							label="New name"
						/>
					)} />
					<IconsGroup>
						<StyledCancelIcon color="secondary" onClick={this.props.onCancelEditMode} />
						<SaveIconButton type="submit" disableRipple={true}>
							<StyledSaveIcon color="secondary" />
						</SaveIconButton>
					</IconsGroup>
				</StyledForm>
			</Formik>
		);
	})(this.props.active && this.props.editMode)

	public renderViewpointName = (viewpoint) => renderWhenTrue(() => (
		<Name>{viewpoint.name}</Name>
	))(!this.props.active)

	public renderViewpointData = (viewpoint) => renderWhenTrue(() => (
		<NameRow>
			<Name>{viewpoint.name}</Name>
			<IconsGroup>
				<StyledEditIcon color="secondary" onClick={this.props.onOpenEditMode} />
				<StyledDeleteIcon color="secondary" onClick={(event) => this.handleDelete(event, viewpoint._id)} />
			</IconsGroup>
		</NameRow>
	))(this.props.active && !this.props.editMode)

	public handleSaveEdit = (viewpointId) => (values) => {
		const { teamspace, modelId } = this.props;
		this.props.updateViewpoint(teamspace, modelId, viewpointId, values.newName);
		this.props.onCancelEditMode();
	}

	public handleDelete = (event, viewpointId) => {
		event.stopPropagation();
		const { teamspace, modelId } = this.props;
		this.props.deleteViewpoint(teamspace, modelId, viewpointId);
	}
	public render() {
		const { viewpoint, handleClick, active } = this.props;

		return (
			<ViewpointItem
				disableRipple
				onClick={handleClick}
				active={active}>

				{this.renderScreenshot(viewpoint)}
				{this.renderScreenshotPlaceholder(!viewpoint.screenshot.thumbnailUrl)}
				{this.renderViewpointForm(viewpoint)}
				{this.renderViewpointData(viewpoint)}
				{this.renderViewpointName(viewpoint)}
			</ViewpointItem>
		);
	}
}

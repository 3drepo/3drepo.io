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
import { Image } from '../../../../../components/image';

import {
	ViewpointItem,
	StyledForm,
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
	active: boolean;
	editMode: boolean;
	teamspace: string;
	modelId: string;
	onCancelEditMode: () => void;
	onSaveEdit: (values) => void;
	onDelete?: (event) => void;
	onOpenEditMode?: () => void;
	onClick?: (viewpoint) => void;
}

export class ViewItem extends React.PureComponent<IProps, any> {
	public renderScreenshotPlaceholder = renderWhenTrue(() => <ThumbnailPlaceholder />);

	public renderViewpointName = renderWhenTrue(() => (
		<Name>{this.props.viewpoint.name}</Name>
	));

	public renderViewpointData = renderWhenTrue(() => (
		<NameRow>
			<Name>{this.props.viewpoint.name}</Name>
			<IconsGroup>
				<StyledEditIcon color="secondary" onClick={this.props.onOpenEditMode} />
				<StyledDeleteIcon color="secondary" onClick={this.props.onDelete} />
			</IconsGroup>
		</NameRow>
	));

	public renderViewpointForm = renderWhenTrue(() => {
		return (
			<Formik
				initialValues={{ newName: this.props.viewpoint.name }}
				onSubmit={this.props.onSaveEdit}>
				<StyledForm>
					<Field name="newName" render={({ field, form }) => (
						<NewViewpointName
							{...field}
							error={Boolean(form.errors.name)}
							helperText={form.errors.name}
							label="View name"
							autoFocus
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
	});

	public renderScreenshot = renderWhenTrue(() => (
		<Image
			src={this.props.viewpoint.screenshot.thumbnailUrl}
			alt={this.props.viewpoint.name}
		/>
	));

	public render() {
		const { viewpoint, onClick, active } = this.props;

		return (
			<ViewpointItem
				disableRipple
				onClick={onClick}
				active={Number(active)}>

				{this.renderScreenshot(viewpoint)}
				{this.renderScreenshotPlaceholder(!viewpoint.screenshot.thumbnailUrl)}
				{this.renderViewpointForm(this.props.active && this.props.editMode)}
				{this.renderViewpointData(this.props.active && !this.props.editMode)}
				{this.renderViewpointName(!this.props.active)}
			</ViewpointItem>
		);
	}
}

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

import { Field, Formik } from 'formik';
import { debounce } from 'lodash';
import React from 'react';

import { renderWhenTrue } from '../../../../../../helpers/rendering';
import { Image } from '../../../../../components/image';

import { ActionMessage } from '../../../../../components/actionMessage/actionMessage.component';
import {
	IconsGroup,
	Name,
	NameRow,
	NewViewpointName,
	SaveIconButton,
	StyledCancelIcon,
	StyledDeleteIcon,
	StyledEditIcon,
	StyledForm,
	StyledSaveIcon,
	ThumbnailPlaceholder,
	ViewpointItem
} from './viewItem.styles';

interface IProps {
	viewpoint: any;
	active: boolean;
	editMode: boolean;
	teamspace: string;
	modelId: string;
	isCommenter: boolean;
	onCancelEditMode: () => void;
	onSaveEdit: (values) => void;
	onDelete?: (teamspace, model, id) => void;
	onOpenEditMode?: () => void;
	onClick?: (viewpoint) => void;
	onChangeName?: (viewpointName) => void;
}

export class ViewItem extends React.PureComponent<IProps, any> {
	public state = {
		isDeletePending: false
	};

	public renderScreenshotPlaceholder = renderWhenTrue(() => <ThumbnailPlaceholder />);

	public renderViewpointName = renderWhenTrue(() => (
		<Name>{this.props.viewpoint.name}</Name>
	));

	public renderViewpointData = renderWhenTrue(() => (
		<NameRow>
			<Name>{this.props.viewpoint.name}</Name>
			{this.props.isCommenter &&
				<IconsGroup disabled={this.state.isDeletePending}>
					<StyledEditIcon onClick={this.props.onOpenEditMode} />
					<StyledDeleteIcon onClick={this.handleDelete} />
				</IconsGroup>
			}
		</NameRow>
	));

	// tslint:disable-next-line: variable-name
	public _handleDelete = debounce((event) => {
		if (!this.state.isDeletePending) {
			event.stopPropagation();
			const { teamspace, modelId, viewpoint } = this.props;
			this.setState({ isDeletePending: true }, () => {
				this.props.onDelete(teamspace, modelId, viewpoint._id);
			});
		}
	}, 150, { leading: true });

	public renderViewpointForm = renderWhenTrue(() => {
		return (
			<Formik
				initialValues={{ newName: this.props.viewpoint.name }}
				onSubmit={this.props.onSaveEdit}>
				<StyledForm>
					<Field name="newName" render={({ field, form }) => (
						<NewViewpointName
							{...field}
							onChange={this.handleNameChange(field)}
							fullWidth
							error={Boolean(form.errors.name)}
							helperText={form.errors.name}
							label="View name"
							autoFocus
						/>
					)} />
					<IconsGroup disabled={this.state.isDeletePending}>
						<StyledCancelIcon onClick={this.props.onCancelEditMode} />
						<SaveIconButton type="submit" disableRipple>
							<StyledSaveIcon />
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

	public renderDeleteMessage = renderWhenTrue(() => <ActionMessage content="This view has been deleted" />);

	public handleDelete = (event) => {
		event.persist();
		this._handleDelete(event);
	}

	public handleNameChange = (field) => (event) => {
		field.onChange(event);

		if (this.props.onChangeName) {
			this.props.onChangeName(event.target.value);
		}
	}

	public render() {
		const { viewpoint, onClick, active } = this.props;

		return (
			<ViewpointItem
				disabled={viewpoint.willBeRemoved}
				disableRipple
				onClick={onClick}
				active={Number(active)}>
				{this.renderDeleteMessage(viewpoint.willBeRemoved)}
				{this.renderScreenshot(viewpoint)}
				{this.renderScreenshotPlaceholder(!viewpoint.screenshot.thumbnailUrl)}
				{this.renderViewpointForm(this.props.active && this.props.editMode)}
				{this.renderViewpointData(this.props.active && !this.props.editMode)}
				{this.renderViewpointName(!this.props.active)}
			</ViewpointItem>
		);
	}
}

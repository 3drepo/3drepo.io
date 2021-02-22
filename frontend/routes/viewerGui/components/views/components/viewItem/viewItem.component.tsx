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
import React, { useState } from 'react';
import * as Yup from 'yup';

import { renderWhenTrue } from '../../../../../../helpers/rendering';

import { Menu, MenuItem, Tooltip } from '@material-ui/core';
import MoreVert from '@material-ui/icons/MoreVert';
import { getViewNameFieldErrorMsg } from '../../../../../../helpers/views';
import { ActionMessage } from '../../../../../components/actionMessage/actionMessage.component';
import {
	HamburgerIconButton,
	IconsGroup,
	Image,
	Name,
	NameRow,
	NewViewpointName,
	SaveIconButton,
	Small,
	StyledCancelIcon,
	StyledEditIcon,
	StyledForm,
	StyledSaveIcon,
	StyledShareIcon,
	ThumbnailPlaceholder,
	ViewpointItem
} from './viewItem.styles';

interface IProps {
	viewpoint: any;
	active?: boolean;
	isAdmin?: boolean;
	editMode?: boolean;
	teamspace: string;
	modelId: string;
	isCommenter?: boolean;
	onCancelEditMode?: () => void;
	onSaveEdit?: (values) => void;
	onDelete?: (teamspace, model, id) => void;
	onShare?: (teamspace, model, id) => void;
	onSetDefault?: (teamspace, model, id) => void;
	onOpenEditMode?: () => void;
	onClick?: (viewpoint) => void;
	onChangeName?: (viewpointName) => void;
	defaultView?: boolean;
	displayShare?: boolean;
}

const ViewItemSchema = Yup.object().shape({
	newName: Yup.string().max(37)
});

const HamburgerMenu = ({onSetAsDefault, onDelete, isAdmin, defaultView}) => {
	const [anchorElement, setAnchorElement] = useState(null);

	const toggleMenu = (e: React.SyntheticEvent) => {
		setAnchorElement(Boolean(anchorElement) ? null : e.currentTarget );
		return false;
	};

	const closeMenuAnd = ( action: (e?) => void ) =>
		(e: React.SyntheticEvent) => {
			toggleMenu(e);
			action(e);
	};

	const renderDeleteMenuItem = renderWhenTrue(() => (
		<MenuItem onClick={closeMenuAnd(onDelete)} >
			Delete
		</MenuItem>
	));

	return (
		<HamburgerIconButton aria-label="Menu" onClick={toggleMenu}>
			<MoreVert />
			<Menu
				anchorEl={anchorElement}
				open={Boolean(anchorElement)}
				onClose={toggleMenu}
			>
				<MenuItem onClick={closeMenuAnd(onSetAsDefault)} disabled={!isAdmin} >
					Set as Default
				</MenuItem>
				{renderDeleteMenuItem(!defaultView)}
			</Menu>
		</HamburgerIconButton>
	);
};

export class ViewItem extends React.PureComponent<IProps, any> {

	private get screenshot() {
		const vpscreenshot = this.props.viewpoint.screenshot || this.props.viewpoint.viewpoint.screenshot ;

		if (vpscreenshot.thumbnailUrl) {
			return vpscreenshot.thumbnailUrl;
		}

		if (!vpscreenshot.startsWith('data:image/png;base64,') && !vpscreenshot.startsWith('https://')) {
			return 'data:image/png;base64,' + vpscreenshot;
		}

		return vpscreenshot;
	}

	public state = {
		isDeletePending: false
	};

	public renderScreenshotPlaceholder = renderWhenTrue(() => (
		<ThumbnailPlaceholder>{'No Image'}</ThumbnailPlaceholder>
	));

	public renderViewpointName = renderWhenTrue(() => (
		<Tooltip title={this.props.viewpoint.name} placement="bottom">
			<Name active={Number(this.props.active)}>
				{this.props.viewpoint.name}{this.renderViewpointDefault(this.props.defaultView)}
			</Name>
		</Tooltip>
	));

	public renderViewpointDefault = renderWhenTrue(() => (
		<Small>(Default View)</Small>
	));

	public renderViewpointNameWithShare = renderWhenTrue(() => (
		<NameRow>
			{this.renderViewpointName(true)}
				<IconsGroup disabled={this.state.isDeletePending}>
					{this.props.onShare && <StyledShareIcon onClick={this.handleShareLink} />}
				</IconsGroup>
		</NameRow>
	));

	public renderViewpointData = renderWhenTrue(() => (
		<NameRow>
			{this.renderViewpointName(true)}
			{this.props.isCommenter &&
				<IconsGroup disabled={this.state.isDeletePending}>
					<StyledEditIcon onClick={this.props.onOpenEditMode} />
					<StyledShareIcon onClick={this.handleShareLink} />
					<HamburgerMenu
						onDelete={this.handleDelete}
						onSetAsDefault={this.handleSetDefault}
						isAdmin={this.props.isAdmin}
						defaultView={this.props.defaultView}
					/>
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

	private handleSubmit = (values) => {
		if (!values.newName) {
			values.newName = this.props.viewpoint.name;
		}

		this.props.onSaveEdit(values);
	}

	public renderViewpointForm = renderWhenTrue(() => {
		return (
			<Formik
				validationSchema={ViewItemSchema}
				initialValues={{ newName: this.props.viewpoint._id ? this.props.viewpoint.name : '' }}
				onSubmit={this.handleSubmit}>
				<StyledForm>
					<Field name="newName" render={({ field, form }) => (
						<NewViewpointName
							{...field}
							onChange={this.handleNameChange(field)}
							fullWidth
							error={Boolean(form.errors.newName)}
							helperText={getViewNameFieldErrorMsg(form.errors.newName)}
							label="View name"
							placeholder={this.props.viewpoint.name}
							autoFocus
							onKeyDown={(e) => e.stopPropagation()/* this is to prevent <Menulist/> to change focus */}
						/>
					)} />
					<IconsGroup disabled={this.state.isDeletePending}>
						<StyledCancelIcon onClick={this.props.onCancelEditMode} />
						<SaveIconButton type="submit" disableRipple id="views-card-save-button">
							<StyledSaveIcon />
						</SaveIconButton>
					</IconsGroup>
				</StyledForm>
			</Formik>
		);
	});

	public renderScreenshot = renderWhenTrue(() => (
		<Image
			src={this.screenshot}
			alt={this.props.viewpoint.name}
		/>
	));

	public renderDeleteMessage = renderWhenTrue(() => <ActionMessage content="This view has been deleted" />);

	public handleDelete = (event) => {
		event.persist();
		this._handleDelete(event);
	}

	public handleShareLink = (event: React.MouseEvent) => {
		event.stopPropagation();
		const { teamspace, modelId, viewpoint: {_id} } = this.props;
		this.props.onShare(teamspace, modelId, _id);
	}

	public handleSetDefault = () => {
		const { teamspace, modelId, viewpoint } = this.props;
		this.props.onSetDefault(teamspace, modelId, viewpoint);
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
				{this.renderScreenshot(this.screenshot)}
				{this.renderScreenshotPlaceholder(!this.screenshot)}
				{this.renderViewpointForm(this.props.active && this.props.editMode)}
				{this.renderViewpointData(this.props.active && !this.props.editMode)}
				{this.renderViewpointName(!this.props.active && !this.props.displayShare)}
				{this.renderViewpointNameWithShare(this.props.displayShare)}
			</ViewpointItem>
		);
	}
}

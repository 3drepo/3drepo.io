/**
 *  Copyright (C) 2020 3D Repo Ltd
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

import { TextField } from '@material-ui/core';
import { Field, Formik } from 'formik';
import React from 'react';
import * as Yup from 'yup';

import { renderWhenTrue } from '../../../../helpers/rendering';
import { schema } from '../../../../services/validation';
import { ActionMessage } from '../../../components/actionMessage/actionMessage.component';
import OpenInViewerButton from '../../../components/openInViewerButton/openInViewerButton.container';
import { PreviewItemInfo } from '../previewItemInfo/previewItemInfo.component';
import { RoleIndicator } from '../previewListItem/previewListItem.styles';
import {
	Collapsable,
	CollapsableContent,
	Container,
	Details,
	MainInfoContainer,
	NotCollapsableContent,
	ScrollableContainer,
	StyledForm,
	Summary,
	ToggleButton,
	ToggleButtonContainer,
	ToggleIcon,
	Typography,
} from './previewDetails.styles';

interface IProps {
	className?: string;
	roleColor: string;
	type?: string;
	id?: string;
	name: string;
	number: number;
	owner: string;
	created: string;
	StatusIconComponent: any;
	statusColor: string;
	defaultExpanded: boolean;
	disableExpanding: boolean;
	editable?: boolean;
	willBeRemoved?: boolean;
	willBeUpdated?: boolean;
	panelName?: string;
	scrolled?: boolean;
	isNew?: boolean;
	showModelButton?: boolean;
	history: any;
	urlParams: any;
	handleHeaderClick?: (event) => void;
	onExpandChange?: (event, expaned: boolean) => void;
	onNameChange?: (event, name: string) => void;
	renderCollapsable?: () => JSX.Element | JSX.Element[];
	renderNotCollapsable?: () => JSX.Element | JSX.Element[];
	actionButton?: React.ReactNode;
	clone?: boolean;
	isSmartGroup?: boolean;
}

const ValidationSchema = Yup.object().shape({
	name: schema.required
});

export class PreviewDetails extends React.PureComponent<IProps, any> {
	public state = {
		expanded: true,
		collapsed: false,
	};

	public headerRef = React.createRef<any>();
	public textFieldRef = React.createRef<any>();
	public scrollableContainerRef = React.createRef<HTMLDivElement>();

	public renderNameWithCounter = renderWhenTrue(() => (
		<Typography paragraph>
			{`${this.props.number}. ${this.props.name}`}
		</Typography>
	));

	public renderName = renderWhenTrue(() => (
		<Typography paragraph>
			{this.props.name}
		</Typography>
	));

	public renderNameField = renderWhenTrue(() => (
		<Formik
			initialValues={{name: this.props.name}}
			validationSchema={ValidationSchema}
			onSubmit={() => {}}
		>
			<StyledForm>
				<Field name="name" render={({field, form}) => {
					const placeholder = this.props.isNew && field.value === '' ? this.props.name : 'Name';
					return (
						<TextField
							{...field}
							inputRef={this.textFieldRef}
							autoFocus
							fullWidth
							placeholder={placeholder}
							onChange={this.handleNameChange(field)}
							error={Boolean(form.errors.name) && !this.props.name}
							helperText={form.errors.name}
							inputProps={{
								maxLength: 120,
								onFocus: () => this.handleFocusName(field, form),
								onBlur: () => this.handleBlurName(field, form)
							}}
						/>
					);
				}} />
			</StyledForm>
		</Formik>
	));

	public renderExpandIcon = renderWhenTrue(() => (
		<ToggleIcon active={Number(this.state.expanded)} />
		));

	public renderCollapsable = renderWhenTrue(() => (
		<CollapsableContent>
			{this.props.renderCollapsable()}
		</CollapsableContent>
	));

	public renderUpdateMessage = renderWhenTrue(() =>
		<ActionMessage content={`This ${this.props.panelName} has been updated by someone else`} />
	);

	public renderDeleteMessage = renderWhenTrue(() =>
		<ActionMessage content={`This ${this.props.panelName} has been deleted by someone else`} />
	);

	public renderToggleButtonContainer = renderWhenTrue(() => (
		<ToggleButtonContainer onClick={this.handleToggle}>
			<ToggleButton>
				{this.renderExpandIcon(!this.props.editable)}
			</ToggleButton>
		</ToggleButtonContainer>
	));

	public renderNotCollapsableContent = () => {
		const Component = this.props.renderNotCollapsable && this.props.renderNotCollapsable();

		return renderWhenTrue(() => (
			<>
				{this.renderToggleButtonContainer(!this.props.disableExpanding)}
				<NotCollapsableContent>
					{this.props.renderNotCollapsable()}
				</NotCollapsableContent>
			</>
		))(!!Component);
	}

	public componentDidMount() {
		const { editable, defaultExpanded } = this.props;
		if (this.textFieldRef.current) {
			this.textFieldRef.current.select();
		}
		this.setState({
			expanded: editable || defaultExpanded
		});
	}

	public handleNameChange = (field) => (event) => {
		field.onChange(event);
		this.props.onNameChange(event, event.target.value);
	}

	public handleToggle = (event) => {
		event.persist();
		this.setState(({ expanded }) => ({ expanded: !expanded }), () => {
			if (this.scrollableContainerRef.current) {
				if (this.state.expanded) {
					setTimeout(() => {
						this.scrollableContainerRef.current.scrollTop = 0;
					}, 50);
					this.setState({ collapsed: false });
				} else {
					setTimeout(() => {
						this.setState({ collapsed: true });
					}, 300);
				}
			}
			if (this.props.onExpandChange) {
				this.props.onExpandChange(event, this.state.expanded);
			}
		});
	}

	public handleFocusName = (field, form) => {
		if (this.props.isNew && !this.props.clone) {
			const nameChanged = form.initialValues.name !== field.value;

			form.setFieldValue('name', nameChanged ? field.value : '');
		}
	}

	public handleBlurName = (field, form) => {
		if (this.props.isNew && !this.props.clone) {
			const nameChanged = this.props.name !== field.value;

			form.setFieldValue('name', nameChanged && field.value ? field.value : this.props.name);
		}
	}

	public renderViewModel = renderWhenTrue(() => {
		const { type, id } = this.props;
		const { teamspace, modelId } = this.props.urlParams;
		return (
			<OpenInViewerButton
				preview
				teamspace={teamspace}
				model={modelId}
				query={`${type}Id=${id}`}
			/>
		);
	});

	public render() {
		const {
			className,
			roleColor,
			// tslint:disable-next-line
			number,
			owner,
			created,
			StatusIconComponent,
			statusColor,
			editable,
			disableExpanding,
			willBeUpdated,
			willBeRemoved,
			renderCollapsable,
			handleHeaderClick,
			showModelButton,
			actionButton,
			isSmartGroup,
			panelName,
		} = this.props;

		return (
			<Container className={className} edit={!this.props.isNew} panelName={panelName} isSmartGroup={isSmartGroup}>
				{this.renderUpdateMessage(willBeUpdated)}
				{this.renderDeleteMessage(willBeRemoved)}
				<Summary
					expandIcon={this.renderExpandIcon(!disableExpanding && !editable)}
					onClick={handleHeaderClick}
					expanded={this.state.expanded && this.props.scrolled}
				>
					<RoleIndicator color={roleColor} ref={this.headerRef} />
					<MainInfoContainer>
						{this.renderNameWithCounter(!editable && number)}
						{this.renderName(!editable && !number)}
						{this.renderNameField(editable)}
						{this.renderViewModel(showModelButton)}
						<PreviewItemInfo
							author={owner}
							createdAt={created}
							StatusIconComponent={StatusIconComponent}
							statusColor={statusColor}
							actionButton={actionButton}
						/>
					</MainInfoContainer>
				</Summary>

				<ScrollableContainer ref={this.scrollableContainerRef} expanded={!this.state.collapsed}>
					<Collapsable onChange={this.handleToggle} expanded={this.state.expanded}>
						<Details>
							{this.renderCollapsable(Boolean(renderCollapsable))}
						</Details>
					</Collapsable>
					{this.renderNotCollapsableContent()}
				</ScrollableContainer>
			</Container>
		);
	}
}

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

import { TextField } from '@material-ui/core';
import { Field, Formik } from 'formik';
import React from 'react';
import * as Yup from 'yup';

import { renderWhenTrue } from '../../../../helpers/rendering';
import { schema } from '../../../../services/validation';
import { ActionMessage } from '../../../components/actionMessage/actionMessage.component';
import OpenInViewerButton from '../../../components/openInViewerButton/openInViewerButton.container';
import { TooltipButton } from '../../../teamspaces/components/tooltipButton/tooltipButton.component';
import { PreviewItemInfo } from '../previewItemInfo/previewItemInfo.component';
import { RoleIndicator } from '../previewListItem/previewListItem.styles';
import {
	Collapsable,
	CollapsableContent,
	Container,
	Details,
	NotCollapsableContent,
	StyledForm,
	Summary,
	ToggleButton,
	ToggleButtonContainer,
	ToggleIcon,
	Typography
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
}

const ValidationSchema = Yup.object().shape({
	name: schema.required
});

const MIN_HEADER_HEIGHT = 38;

export class PreviewDetails extends React.PureComponent<IProps, any> {
	public state = {
		expanded: false
	};

	public headerRef = React.createRef<any>();

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

	public renderNotCollapsableContent = renderWhenTrue(() => {
		return (
			<>
				<ToggleButtonContainer onClick={this.handleToggle} expanded={this.state.expanded}>
					<ToggleButton>
						{this.renderExpandIcon(!this.props.editable)}
					</ToggleButton>
				</ToggleButtonContainer>
				<NotCollapsableContent>
					{this.props.renderNotCollapsable()}
				</NotCollapsableContent>
			</>
		);
	});

	public get headerHeight() {
		if (this.headerRef.current) {
			const { height } = this.headerRef.current.getBoundingClientRect();
			return height >= MIN_HEADER_HEIGHT ? height : MIN_HEADER_HEIGHT;
		}

		return MIN_HEADER_HEIGHT;
	}

	public componentDidMount() {
		const { editable, defaultExpanded } = this.props;
		this.setState({
			defaultExpanded: editable || defaultExpanded,
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
			if (this.props.onExpandChange) {
				this.props.onExpandChange(event, this.state.expanded);
			}
		});
	}

	public handleFocusName = (field, form) => {
		const nameChanged = form.initialValues.name !== field.value;

		if (this.props.isNew) {
			form.setFieldValue('name', nameChanged ? field.value : '');
		}
	}

	public handleBlurName = (field, form) => {
		const nameChanged = this.props.name !== field.value;
		if (this.props.isNew) {
			form.setFieldValue('name', nameChanged && field.value ? field.value : this.props.name);
		}
	}

	public renderViewModel = renderWhenTrue(() => {
		const { type, id } = this.props;
		const { teamspace, modelId } = this.props.urlParams;
		return (
			<OpenInViewerButton
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
			renderNotCollapsable,
			handleHeaderClick,
			showModelButton
		} = this.props;

		return (
			<Container className={className}>
				{this.renderUpdateMessage(willBeUpdated)}
				{this.renderDeleteMessage(willBeRemoved)}
				<Summary
					expandIcon={this.renderExpandIcon(!disableExpanding && !editable)}
					onClick={handleHeaderClick}
					scrolled={this.props.scrolled ? 1 : 0}
				>
					<RoleIndicator color={roleColor} ref={this.headerRef} />
					{this.renderNameWithCounter(!editable && number)}
					{this.renderName(!editable && !number)}
					{this.renderNameField(editable)}
					{this.renderViewModel(showModelButton)}
				</Summary>

				<Collapsable onChange={this.handleToggle} expanded={this.state.expanded}>
					<Details margin={this.headerHeight}>
						<PreviewItemInfo
							author={owner}
							createdAt={created}
							StatusIconComponent={StatusIconComponent}
							statusColor={statusColor}
						/>
						{this.renderCollapsable(Boolean(renderCollapsable))}
					</Details>
				</Collapsable>
				{this.renderNotCollapsableContent(!!renderNotCollapsable)}
			</Container>
		);
	}
}

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
import * as Yup from 'yup';
import { Formik, Field } from 'formik';
import { TextField } from '@material-ui/core';

import { schema } from '../../../../services/validation';
import { ActionMessage } from '../../../components/actionMessage/actionMessage.component';
import { renderWhenTrue } from '../../../../helpers/rendering';
import { PreviewItemInfo } from '../previewItemInfo/previewItemInfo.component';
import { RoleIndicator } from '../previewListItem/previewListItem.styles';
import {
	Content,
	Container,
	Collapsable,
	Details,
	Summary,
	CollapsableContent,
	ToggleButtonContainer,
	ToggleButton,
	ToggleIcon,
	StyledForm,
	NotCollapsableContent,
	Typography
} from './previewDetails.styles';

interface IProps {
	className?: string;
	roleColor: string;
	name: string;
	number: number;
	author: string;
	createdDate: string;
	StatusIconComponent: any;
	statusColor: string;
	defaultExpanded: boolean;
	disableExpanding: boolean;
	editable?: boolean;
	willBeRemoved?: boolean;
	willBeUpdated?: boolean;
	panelName?: string;
	scrolled?: boolean;
	handleHeaderClick?: (event) => void;
	onExpandChange?: (event, expaned: boolean) => void;
	onNameChange?: (event, name: string) => void;
	renderCollapsable?: () => JSX.Element | JSX.Element[];
	renderNotCollapsable?: () => JSX.Element | JSX.Element[];
}

const ValidationSchema = Yup.object().shape({
	name: schema.required
});

export class PreviewDetails extends React.PureComponent<IProps, any> {
	public state = {
		expanded: false
	};

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

	public renderNameWithCounter = renderWhenTrue(() => (
		<Typography>{`${this.props.number}. ${this.props.name}`}</Typography>
	));

	public renderName = renderWhenTrue(() => (
		<Typography>{this.props.name}</Typography>
	));

	public renderNameField = renderWhenTrue(() => (
		<Formik
			initialValues={{name: this.props.name}}
			validationSchema={ValidationSchema}
			onSubmit={() => {}}
		>
			<StyledForm>
				<Field name="name" render={({ field, form }) => (
					<TextField
						{...field}
						autoFocus
						fullWidth
						placeholder="Title"
						onChange={this.handleNameChange(field)}
						error={Boolean(form.errors.name)}
						helperText={form.errors.name}
						inputProps={
							{maxLength: 120}}
					/>
				)} />
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

	public renderNotCollapsable = renderWhenTrue(() => (
		<Content>
			{this.props.renderNotCollapsable()}
		</Content>
	));

	public renderUpdateMessage = renderWhenTrue(() =>
		<ActionMessage content={`This ${this.props.panelName} has been updated by someone else`} />
	);

	public renderDeleteMessage = renderWhenTrue(() =>
		<ActionMessage content={`This ${this.props.panelName} has been deleted by someone else`} />
	);

	public render() {
		const {
			className,
			roleColor,
			// tslint:disable-next-line
			number,
			author,
			createdDate,
			StatusIconComponent,
			statusColor,
			editable,
			disableExpanding,
			willBeUpdated,
			willBeRemoved,
			renderCollapsable,
			renderNotCollapsable,
			handleHeaderClick
		} = this.props;

		const createdAt = !editable ? createdDate : null;

		return (
			<Container className={className}>
				{this.renderUpdateMessage(willBeUpdated)}
				{this.renderDeleteMessage(willBeRemoved)}
				<Summary
					expandIcon={this.renderExpandIcon(!disableExpanding && !editable)}
					onClick={handleHeaderClick}
					scrolled={this.props.scrolled ? 1 : 0}
				>
						<RoleIndicator color={roleColor} />
						{this.renderNameWithCounter(!editable && number)}
						{this.renderName(!editable && !number)}
						{this.renderNameField(editable)}
					</Summary>

				<Collapsable onChange={this.handleToggle} expanded={this.state.expanded}>
					<Details>
						<PreviewItemInfo
							author={author}
							createdAt={createdAt}
							StatusIconComponent={StatusIconComponent}
							statusColor={statusColor}
						/>
						{this.renderCollapsable(Boolean(renderCollapsable))}
					</Details>
				</Collapsable>
				<ToggleButtonContainer onClick={this.handleToggle} expanded={this.state.expanded}>
					<ToggleButton>
						{this.renderExpandIcon(!editable)}
					</ToggleButton>
				</ToggleButtonContainer>
				<NotCollapsableContent>
					{this.renderNotCollapsable(Boolean(renderNotCollapsable))}
				</NotCollapsableContent>
			</Container>
		);
	}
}

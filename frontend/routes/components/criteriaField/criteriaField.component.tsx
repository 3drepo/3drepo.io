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
import { uniqBy, isEqual } from 'lodash';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import InputLabel from '@material-ui/core/InputLabel';

import {
	Container,
	ChipsContainer,
	ButtonContainer,
	IconButton,
	StyledMoreIcon,
	SelectedCriteria,
	FormContainer,
	MenuItem,
	OptionsList
} from './criteriaField.styles';
import { renderWhenTrue } from '../../../helpers/rendering';
import { ButtonMenu } from '../buttonMenu/buttonMenu.component';
import { NewCriterionForm } from './newCriterionForm.component';
import { CriteriaPasteField } from './components/criteriaPasteField/criteriaPasteField.components';
import { Chip } from '../chip/chip.component';
import { ICriteriaFieldState } from '../../../modules/groups/groups.redux';

interface IProps {
	className?: string;
	name?: string;
	value: any[];
	label?: string;
	criteria: any;
	disabled: boolean;
	fieldNames: any[];
	isPasteEnabled: boolean;
	pastedCriteria: string;
	onChange: (criteria) => void;
	onStateChange: (criteriaState) => void;
	onChipsClick: (event?) => void;
}

interface IState {
	selectedCriteria?: any[];
}

const MenuButton = ({ IconProps, Icon, ...props }) => (
	<IconButton
		{...props}
		aria-label="Show criteria menu"
		aria-haspopup="true"
	>
		<StyledMoreIcon {...IconProps} />
	</IconButton>
);

const compareCriteria = ({ operator, values = [] }) => `${operator}.${values.join('.')}`;

export class CriteriaField extends React.PureComponent<IProps, IState> {
	public state = {
		selectedCriteria: []
	};

	public componentDidMount() {
		if (this.props.value) {
			this.setState({ selectedCriteria: this.props.value });
		}
	}
	public handleDelete = (criteriaToRemove) => () => {
		const selectedCriteria = this.props.value.filter((criteria, index) => {
			return !isEqual(criteria, criteriaToRemove);
		});

		this.setState({ selectedCriteria }, this.handleChange);
	}

	public clearCriteria = () => {
		this.setState({ selectedCriteria: [] }, this.handleChange);
	}

	public togglePasteMode = () => {
		this.props.onStateChange(({ isPasteEnabled: !this.props.isPasteEnabled }));
	}

	public deselectCriterion = () => {

	}

	public handleAddNew = (newCriterion) => {
		this.setState(
			({ selectedCriteria }) => ({ selectedCriteria: [...selectedCriteria, newCriterion]}),
			this.handleChange
		);
	}

	public handleChange = () => {
		if (this.props.onChange) {
			this.props.onChange({
				target: {
					value: this.state.selectedCriteria,
					name: this.props.name
				}
			});
		}
	}

	public handlePasteFieldChange = (pastedCriteria) => {
		this.props.onStateChange({ pastedCriteria });
	}

	public handlePaste = (pastedCriteria) => {
		this.togglePasteMode();
		this.setState((prevState) => ({
			selectedCriteria: uniqBy([
				...prevState.selectedCriteria,
				...pastedCriteria
			], compareCriteria)
		}), this.handleChange);
	}

	public handleCriteriaClick = (criteria) => () => {
		this.props.onChipsClick(criteria);
	}

	public renderCriterion = (criteria, index) => (
		<Chip
			key={index}
			label={criteria.label}
			onDelete={this.handleDelete(criteria)}
			onClick={this.handleCriteriaClick(criteria)}
			clickable
		/>
	)

	public renderCriteriaField = renderWhenTrue(() => (
		<CriteriaPasteField
			name="pasteField"
			initialValue={this.props.pastedCriteria}
			onChange={this.handlePaste}
			onStateChange={this.handlePasteFieldChange}
			onCancel={this.togglePasteMode}
		/>
	));

	public renderCriteriaChips = renderWhenTrue(() => (
		<ChipsContainer>
			{this.props.value.map(this.renderCriterion)}
		</ChipsContainer>
	));

	public renderCopyOption = () => (
		<CopyToClipboard text={JSON.stringify(this.props.value)}>
			<MenuItem>
				Copy filters
			</MenuItem>
		</CopyToClipboard>
	)

	public renderOptions = () => {
		const options = [{
			label: 'Copy criteria',
			Component: this.renderCopyOption
		}, {
			label: 'Paste criteria',
			onClick: this.togglePasteMode
		}, {
			label: 'Deselect',
			onClick: this.deselectCriterion
		}, {
			label: 'Clear all',
			onClick: this.clearCriteria
		}];

		return (
			<OptionsList>
				{options.map(({ label, Component = MenuItem, onClick }, index) => (
					<Component key={index} onClick={onClick}>{label}</Component>
				))}
			</OptionsList>
		);
	}

	public renderOptionsMenu = renderWhenTrue(() => (
		<ButtonContainer>
			<ButtonMenu
				renderButton={MenuButton}
				renderContent={this.renderOptions}
				PaperProps={{ style: { overflow: 'initial', boxShadow: 'none' } }}
				PopoverProps={{ anchorOrigin: { vertical: 'center', horizontal: 'left' } }}
				ButtonProps={{ disabled: false }}
			/>
		</ButtonContainer>
	));

	public renderForm = () => (
		<FormContainer>
			<NewCriterionForm
				criterion={{}}
				onSubmit={this.handleAddNew}
				fieldNames={this.props.fieldNames}
			/>
		</FormContainer>
	)

	public render() {
		return (
			<Container className={this.props.className}>
				<InputLabel shrink>{this.props.label}</InputLabel>
				<SelectedCriteria>
					{this.renderCriteriaChips(!!this.props.value.length)}
					{this.renderCriteriaField(this.props.isPasteEnabled)}
					{this.renderOptionsMenu(!this.props.isPasteEnabled)}
				</SelectedCriteria>
				{this.renderForm()}
			</Container>
		);
	}
}

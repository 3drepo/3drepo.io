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

import { isEqual, uniqBy } from 'lodash';
import React from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';

import { getCriteriaLabel, getUpdatedCriteria, prepareCriterion } from '../../../helpers/criteria';
import { renderWhenTrue } from '../../../helpers/rendering';
import {
	ButtonContainer,
	Chip,
	ChipsContainer,
	ChipsDeselectCatcher,
	Container,
	FiltersContainer,
	FormContainer,
	IconButton,
	InputLabel,
	MenuItem,
	OptionsList,
	Placeholder,
	SelectedCriteria,
	StyledMoreIcon
} from './criteriaField.styles';

import { ButtonMenu } from '../buttonMenu/buttonMenu.component';
import { CriteriaPasteField } from './components/criteriaPasteField/criteriaPasteField.components';
import { NewCriterionForm } from './newCriterionForm.component';

interface IProps {
	className?: string;
	name?: string;
	placeholder?: string;
	value: any[];
	label?: string;
	disabled: boolean;
	fieldNames: any[];
	isPasteEnabled: boolean;
	pastedCriteria: string;
	selectedCriterion: any;
	criterionForm: any;
	onChange: (criteria) => void;
	setState: (criteriaState) => void;
	onCriterionSelect: (event?) => void;
}

interface IState {
	selectedCriteria?: any[];
	criterionForm?: any;
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

const emptyCriterion = {
	field: '',
	operator: '',
	values: []
};

export class CriteriaField extends React.PureComponent<IProps, IState> {
	public state = {
		selectedCriteria: [],
		criterionForm: { ...emptyCriterion }
	};

	public renderPlaceholder = renderWhenTrue(() => (
		<Placeholder>{this.props.placeholder}</Placeholder>
	));

	public renderCriteriaPasteField = renderWhenTrue(() => (
		<CriteriaPasteField
			name="pasteField"
			initialValue={this.props.pastedCriteria}
			onChange={this.handlePaste}
			setState={this.handlePasteFieldChange}
			onCancel={this.togglePasteMode}
		/>
	));

	public renderCriteriaChips = renderWhenTrue(() => (
		<ChipsContainer>
			<ChipsDeselectCatcher onClick={this.deselectCriterion} />
			{this.state.selectedCriteria.map(this.renderCriterion)}
		</ChipsContainer>
	));

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

	public componentDidMount() {
		const { value, criterionForm, selectedCriterion } = this.props;
		const changes = {} as IState;

		if (value) {
			changes.selectedCriteria = value;
		}

		if (criterionForm && !selectedCriterion) {
			changes.criterionForm = criterionForm;
		}

		if (selectedCriterion) {
			changes.criterionForm = this.getSelectedCriterionForm(changes.selectedCriteria);
		}

		this.setState(changes);
	}

	public componentDidUpdate(prevProps) {
		if (this.props.selectedCriterion !== prevProps.selectedCriterion) {
			const criterionForm = this.getSelectedCriterionForm(this.state.selectedCriteria);
			this.setState({ criterionForm });
		} else if (!isEqual(prevProps.criterionForm, this.props.criterionForm)) {
			this.setState({ criterionForm: this.props.criterionForm });
		}
	}

	public getSelectedCriterionForm(selectedCriteria = []) {
		const criterionForm = selectedCriteria.find(this.isCriterionActive);
		return criterionForm || { ...emptyCriterion };
	}

	public handleDelete = (criteriaToRemove) => () => {
		const selectedCriteria = this.props.value.filter((criteria) => {
			return criteria._id !== criteriaToRemove._id;
		});

		if (criteriaToRemove._id === this.props.selectedCriterion) {
			this.props.setState({ selectedCriterion: '' });
		}

		this.setState({ selectedCriteria }, this.handleChange);
	}

	public clearCriteria = () => {
		this.setState({ selectedCriteria: [] }, this.handleChange);
	}

	public togglePasteMode = () => {
		this.props.setState({
			pastedCriteria: '',
			isPasteEnabled: !this.props.isPasteEnabled
		});
	}

	public deselectCriterion = () => {
		this.props.setState({ selectedCriterion: '' });
	}

	public handleCriterionSubmit = (newCriterion) => {
		const criterionForm = { ...emptyCriterion };

		this.setState(
			({ selectedCriteria }) => ({
				selectedCriteria: getUpdatedCriteria(selectedCriteria, newCriterion),
				criterionForm
			}),
			() => {
				this.handleChange();
				this.props.setState({
					criterionForm,
					selectedCriterion: ''
				});
			}
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

	public handleNewCriterionChange = (criterionForm) => {
		this.props.setState({ criterionForm });
	}

	public handlePasteFieldChange = (pastedCriteria) => {
		this.props.setState({ pastedCriteria });
	}

	public handlePaste = (pastedCriteria) => {
		this.togglePasteMode();
		this.setState((prevState) => ({
			selectedCriteria: uniqBy([
				...prevState.selectedCriteria,
				...pastedCriteria.map(prepareCriterion)
			], '_id')
		}), this.handleChange);
	}

	public handleCriteriaClick = (criterion) => () => {
		this.props.setState({ selectedCriterion: criterion._id });
	}

	public isCriterionActive = (criterion) => {
		const { selectedCriterion } = this.props;
		return criterion._id === selectedCriterion;
	}

	public renderCriterion = (criterion) => (
		<Chip
			key={criterion._id}
			color={this.isCriterionActive(criterion) ? 'primary' : 'default'}
			label={getCriteriaLabel(criterion)}
			onDelete={this.handleDelete(criterion)}
			onClick={this.handleCriteriaClick(criterion)}
			clickable
		/>
	)

	public renderCopyOption = (props) => (
		<CopyToClipboard text={JSON.stringify(this.props.value)}>
			<MenuItem {...props}>
				Copy filters
			</MenuItem>
		</CopyToClipboard>
	)

	public renderOptions = () => {
		const options = [{
			Component: this.renderCopyOption
		}, {
			label: 'Paste filters',
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

	public renderForm = () => (
		<FormContainer>
			<NewCriterionForm
				criterion={this.state.criterionForm}
				setState={this.handleNewCriterionChange}
				onSubmit={this.handleCriterionSubmit}
				fieldNames={this.props.fieldNames}
				alreadySelectedFilters={this.props.value}
				selectedCriterion={this.props.selectedCriterion}
			/>
		</FormContainer>
	)

	public render() {
		const { placeholder, value, label, className, isPasteEnabled } = this.props;
		return (
			<Container className={className}>
				<FiltersContainer>
					<InputLabel>{label}</InputLabel>
					<SelectedCriteria>
						{this.renderPlaceholder(placeholder && !value.length && !isPasteEnabled)}
						{this.renderCriteriaChips(!!value.length)}
						{this.renderCriteriaPasteField(isPasteEnabled)}
						{this.renderOptionsMenu(!isPasteEnabled)}
					</SelectedCriteria>
				</FiltersContainer>
				{this.renderForm()}
			</Container>
		);
	}
}

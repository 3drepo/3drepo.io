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

import {
	Container,
	InputLabel,
	ChipsContainer,
	ChipsDeselectCatcher,
	ButtonContainer,
	IconButton,
	StyledMoreIcon,
	SelectedCriteria,
	FormContainer,
	MenuItem,
	OptionsList,
	Placeholder,
	Chip
} from './criteriaField.styles';
import { renderWhenTrue } from '../../../helpers/rendering';
import { getCriteriaLabel } from '../../../helpers/criteria';

import { ButtonMenu } from '../buttonMenu/buttonMenu.component';
import { NewCriterionForm } from './newCriterionForm.component';
import { CriteriaPasteField } from './components/criteriaPasteField/criteriaPasteField.components';

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

const getUniqueId = ({ operator, values = [] }) => `${operator}.${values.join('.')}`;

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

	public componentDidMount() {
		const { value, criterionForm, selectedCriterion } = this.props;
		const changes = {} as IState;

		if (value) {
			changes.selectedCriteria = value;
		}

		if (criterionForm && !selectedCriterion) {
			changes.criterionForm = criterionForm;
		}

		this.setState(changes);
	}

	public componentDidUpdate(prevProps) {
		if (this.props.selectedCriterion !== prevProps.selectedCriterion) {
			const criterionForm = this.state.selectedCriteria.find(this.isCriterionActive);
			this.setState({ criterionForm: criterionForm || { ...emptyCriterion } });
		}
	}

	public handleDelete = (criteriaToRemove) => () => {
		const selectedCriteria = this.props.value.filter((criteria) => {
			return !isEqual(criteria, criteriaToRemove);
		});

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

	public handleAddNew = (newCriterion) => {
		const criterionForm = { ...emptyCriterion };
		this.setState(
			({ selectedCriteria }) => ({
				selectedCriteria: [...selectedCriteria, newCriterion],
				criterionForm
			}),
			() => {
				this.handleChange();
				this.props.setState({ criterionForm });
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
				...pastedCriteria
			], getUniqueId)
		}), this.handleChange);
	}

	public handleCriteriaClick = (criteria) => () => {
		this.props.setState({ selectedCriterion: getUniqueId(criteria) });
	}

	public isCriterionActive = (criterion) => {
		const { selectedCriterion } = this.props;
		return getUniqueId(criterion) === selectedCriterion;
	}

	public renderPlaceholder = renderWhenTrue(() => (
		<Placeholder>{this.props.placeholder}</Placeholder>
	));

	public renderCriterion = (criteria, index) => (
		<Chip
			key={index}
			color={this.isCriterionActive(criteria) ? 'primary' : 'default'}
			label={getCriteriaLabel(criteria)}
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
				criterion={this.state.criterionForm}
				setState={this.handleNewCriterionChange}
				onSubmit={this.handleAddNew}
				fieldNames={this.props.fieldNames}
			/>
		</FormContainer>
	)

	public render() {
		const { placeholder, value, label, className, isPasteEnabled } = this.props;
		return (
			<Container className={className}>
				<InputLabel shrink>{label}</InputLabel>
				<SelectedCriteria>
					{this.renderPlaceholder(placeholder && !value.length && !isPasteEnabled)}
					{this.renderCriteriaChips(!!value.length)}
					{this.renderCriteriaField(isPasteEnabled)}
					{this.renderOptionsMenu(!isPasteEnabled)}
				</SelectedCriteria>
				{this.renderForm()}
			</Container>
		);
	}
}

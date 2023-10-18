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
import { PureComponent } from 'react';
import { isEqual, uniqBy } from 'lodash';
import { CopyToClipboard } from 'react-copy-to-clipboard';

import { getUpdatedCriteria, prepareCriterion } from '../../../helpers/criteria';
import { renderWhenTrue } from '../../../helpers/rendering';
import { ButtonMenu } from '../buttonMenu/buttonMenu.component';
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

import { CriteriaPasteField } from './criteriaPasteField/criteriaPasteField.components';
import { NewCriterionForm } from './newCriterionForm/newCriterionForm.component';

interface IProps {
	className?: string;
	name?: string;
	placeholder?: string;
	value: any[];
	label?: string;
	disabled: boolean;
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
	menuOpen?: boolean;
}

const MenuButton = ({ IconProps, Icon, ...props }) => (
	<IconButton
        {...props}
        aria-label="Show criteria menu"
        aria-haspopup="true"
        size="large"
	>
		<StyledMoreIcon {...IconProps} />
	</IconButton>
);

export class CriteriaField extends PureComponent<IProps, IState> {
	public state = {
		selectedCriteria: [],
		criterionForm: null,
		menuOpen: false,
	};

	public setMenuOpen = (menuOpen) => {
		this.setState({ ...this.state, menuOpen });
	}

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

	public renderOptionsMenu = () => (
		<ButtonContainer>
			<ButtonMenu
				open={this.state.menuOpen}
				onOpen={() => this.setMenuOpen(true)}
				renderButton={MenuButton}
				renderContent={this.renderOptions}
				PaperProps={{ style: { overflow: 'initial', boxShadow: 'none' } }}
				PopoverProps={{ anchorOrigin: { vertical: 'center', horizontal: 'left' } }}
				ButtonProps={{ disabled: false }}
			/>
		</ButtonContainer>
	);

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

		if (this.props.value !== prevProps.value) {
			this.setState({selectedCriteria: this.props.value});
		}

	}

	public getSelectedCriterionForm(selectedCriteria = []) {
		const criterionForm = selectedCriteria.find(this.isCriterionActive);
		return criterionForm || null;
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
		const criterionForm = null;

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
			label={criterion.name}
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
		const options = [
			{
				Component: this.renderCopyOption,
				disabled: !this.state.selectedCriteria?.length
			}, {
				label: 'Paste filters',
				onClick: this.togglePasteMode
			}, {
				label: 'Deselect',
				onClick: this.deselectCriterion,
				disabled: !this.props.selectedCriterion
			}, {
				label: 'Clear all',
				onClick: this.clearCriteria,
				disabled: !this.state.selectedCriteria?.length
			}
		];

		const closeMenuAndExecutCallback = (callback?) => (event) => {
			this.setMenuOpen(false);
			callback?.(event);
		};

		return (
			<OptionsList>
				{options.map(({ label, Component = MenuItem, onClick, disabled }, index) => (
					<Component key={index} onClick={closeMenuAndExecutCallback(onClick)} disabled={disabled}>{label}</Component>
				))}
			</OptionsList>
		);
	}

	public renderForm = () => (
		<FormContainer>
			<NewCriterionForm
				criterion={this.state.criterionForm}
				onSubmit={this.handleCriterionSubmit}
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
						{this.renderOptionsMenu()}
					</SelectedCriteria>
				</FiltersContainer>
				{this.renderForm()}
			</Container>
		);
	}
}

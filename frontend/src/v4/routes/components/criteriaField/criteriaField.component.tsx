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
import { uniqBy } from 'lodash';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { Tooltip } from '@mui/material';

import { ICriteriaFieldState } from '@/v4/modules/groups/groups.redux';
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
	Criteria,
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
	selectedCriterionId: any;
	criterionForm: any;
	onChange: (criteria) => void;
	onClose: (criterion) => void;
	setCriteriaFieldState: (criteriaFieldState: Partial<ICriteriaFieldState>) => void;
	onCriterionSelect: (event?) => void;
	updateEditingGroup: (group) => void;
	setSelectedCriterionId: (id: string) => void;
}

interface IState {
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
		menuOpen: false,
	};

	public setMenuOpen = (menuOpen) => {
		this.setState({ menuOpen });
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
			alreadySelectedFilters={this.props.value}
		/>
	));

	public renderCriteriaChips = renderWhenTrue(() => (
		<ChipsContainer>
			<ChipsDeselectCatcher onClick={this.deselectCriterion} />
			{this.getCriteria().map(this.renderCriterion)}
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

	public getCriteria() {
		return this.props.value;
	}

	public getSelectedCriterionForm() {
		const criteria = this.getCriteria().find(this.isCriterionSelected);
		return criteria || null;
	}

	public handleDeleteCriterion = (criterionToRemove) => () => {
		if (this.isCriterionSelected(criterionToRemove)) {
			this.props.setSelectedCriterionId('');
		}

		const remainingCriteria = this.props.value.filter((criteria) => {
			return criteria._id !== criterionToRemove._id;
		});

		this.handleChange(remainingCriteria);
	}

	public clearCriteria = () => {
		this.handleChange([]);
	}

	public togglePasteMode = () => {
		this.props.setCriteriaFieldState({
			pastedCriteria: '',
			isPasteEnabled: !this.props.isPasteEnabled,
			criterionForm: null,
		});
	}

	public deselectCriterion = () => {
		this.props.setSelectedCriterionId('');
	}

	public handleCriterionSubmit = (newCriterion) => {
		this.props.updateEditingGroup({ rules: getUpdatedCriteria(this.getCriteria(), newCriterion) });
		this.props.setSelectedCriterionId('');
	}

	public handleChange = (criteria?) => {
		if (this.props.onChange) {
			this.props.onChange({
				target: {
					value: criteria ?? this.getCriteria(),
					name: this.props.name
				}
			});
		}
	}

	public handlePasteFieldChange = (pastedCriteria) => {
		this.props.setCriteriaFieldState({ pastedCriteria, criterionForm: null });
	}

	public handlePaste = (pastedCriteria) => {
		this.togglePasteMode();
		const newCriteria = uniqBy([
			...this.getCriteria(),
			...pastedCriteria.map(prepareCriterion)
		], '_id');
		this.handleChange(newCriteria);
	}

	public handleCriterionClick = (criterion) => () => {
		this.props.setSelectedCriterionId(criterion._id);
	}

	public isCriterionSelected = (criterion) => {
		const { selectedCriterionId } = this.props;
		return criterion._id === selectedCriterionId;
	}

	public renderCriterion = (criterion) => (
		<Tooltip title={criterion.name} key={criterion._id}>
			<Chip
				color={this.isCriterionSelected(criterion) ? 'primary' : 'default'}
				label={criterion.name}
				onDelete={this.props.disabled ? null : this.handleDeleteCriterion(criterion)}
				onClick={this.handleCriterionClick(criterion)}
				clickable
			/>
		</Tooltip>
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
				disabled: !this.getCriteria()?.length
			}, {
				label: 'Paste filters',
				onClick: this.togglePasteMode,
				disabled: this.props.disabled,
			}, {
				label: 'Deselect',
				onClick: this.deselectCriterion,
				disabled: !this.props.selectedCriterionId
			}, {
				label: 'Clear all',
				onClick: this.clearCriteria,
				disabled: this.props.disabled || !this.getCriteria()?.length,
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
				criteria={this.getCriteria()}
				selectedCriterion={this.getSelectedCriterionForm()}
				criterionForm={this.props.criterionForm}
				onSubmit={this.handleCriterionSubmit}
				onClose={this.props.onClose}
			/>
		</FormContainer>
	)

	public render() {
		const { placeholder, value, label, className, isPasteEnabled } = this.props;
		return (
			<Container className={className}>
				<FiltersContainer>
					<InputLabel>{label}</InputLabel>
					<Criteria>
						{this.renderPlaceholder(placeholder && !value.length && !isPasteEnabled)}
						{this.renderCriteriaChips(!!value.length)}
						{this.renderCriteriaPasteField(isPasteEnabled)}
						{this.renderOptionsMenu()}
					</Criteria>
				</FiltersContainer>
				{this.renderForm()}
			</Container>
		);
	}
}

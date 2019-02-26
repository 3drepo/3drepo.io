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
import { CopyToClipboard } from 'react-copy-to-clipboard';
import InputLabel from '@material-ui/core/InputLabel';

import {
	Container,
	ChipsContainer,
	Chip,
	ButtonContainer,
	IconButton,
	StyledMoreIcon,
	StyledSaveIcon,
	SelectedCriteria,
	FormContainer,
	MenuItem,
	PasteContainer
} from './criteriaField.styles';
import { renderWhenTrue } from '../../../helpers/rendering';
import { ButtonMenu } from '../buttonMenu/buttonMenu.component';
import { NewCriterionForm } from './newCriterionForm.component';
import { TextField } from '../textField/textField.component';

interface IProps {
	className?: string;
	name?: string;
	value: any[];
	label?: string;
	criteria: any;
	onChange: (criteria) => void;
	onFormChange: (criterion) => void;
	onChipsClick: (event?) => void;
}

interface IState {
	selectedCriteria?: any[];
	pasteMode?: boolean;
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

export class CriteriaField extends React.PureComponent<IProps, IState> {
	public state = {
		selectedCriteria: [{
			label: 'Test criteria basasd asd a'
		}, {
			label: 'Teasdaasd'
		}, {
			label: 'Teasdaasd'
		}, {
			label: 'Teasdaasd'
		}],
		pasteMode: false
	};

	public componentDidMount() {
		if (this.props.value) {
			// this.setState({ selectedCriteria: this.props.value });
		}
	}

	public handleDelete = () => {

	}

	public handleAddNew = () => {

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

	public handlePaste = (event) => {
		event.preventDefault();

		try {
			const newSelectedCriteria = JSON.parse(event.clipboardData.getData('text'));

			if (!newSelectedCriteria.some(({ label, operator }) => !label || !operator)) {
				throw new Error();
			}

			this.togglePasteMode();
			this.setState((prevState) => ({
				selectedCriteria: [
					...prevState.selectedCriteria,
					...newSelectedCriteria
				]
			}), this.handleChange);
		} catch (error) {
			console.error('Unsupported criteria format');
		}
	}

	public renderCriterion = (criteria, index) => (
		<Chip
			key={index}
			label={criteria.label}
			onDelete={this.handleDelete}
			onClick={this.props.onChipsClick}
			clickable
		/>
	)

	public renderCriteriaField = renderWhenTrue(() => (
		<PasteContainer>
			<TextField
				onPaste={this.handlePaste}
				placeholder="Paste criteria here"
				fullWidth
				autoFocus
			/>
			<IconButton
					onClick={this.handlePasteSave}
					aria-label="Save pasted criteria"
					aria-haspopup="true"
				>
				<StyledSaveIcon />
			</IconButton>
		</PasteContainer>
	));

	public renderCriteriaChips = renderWhenTrue(() => (
		<ChipsContainer>
			{this.state.selectedCriteria.map(this.renderCriterion)}
			{this.renderCriteriaField(this.state.pasteMode)}
		</ChipsContainer>
	));

	public renderCopyOption = () => (
		<CopyToClipboard text={JSON.stringify(this.state.selectedCriteria)}>
			<MenuItem>
				Copy filters
			</MenuItem>
		</CopyToClipboard>
	)

	public handlePasteSave = () => {

	}

	public togglePasteMode = () => {
		this.setState(({ pasteMode }) => ({ pasteMode: !pasteMode }));
	}

	public deselectCriterion = () => {

	}

	public clearCriteria = () => {

	}

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
			<>
				{options.map(({ label, Component = MenuItem, onClick }, index) => (
					<Component key={index} onClick={onClick}>{label}</Component>
				))}
			</>
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
			/>
		</FormContainer>
	)

	public render() {
		return (
			<Container className={this.props.className}>
				<InputLabel shrink>{this.props.label}</InputLabel>
				<SelectedCriteria>
					{this.renderCriteriaChips(!!this.state.selectedCriteria.length)}
					{this.renderOptionsMenu(!this.state.pasteMode)}
				</SelectedCriteria>
				{this.renderForm()}
			</Container>
		);
	}
}

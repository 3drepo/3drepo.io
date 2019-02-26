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
import InputLabel from '@material-ui/core/InputLabel';
import Label from '@material-ui/core/FormLabel';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';

import {
	Container,
	ChipsContainer,
	Chip,
	ButtonContainer,
	IconButton,
	StyledMoreIcon,
	SelectedCriteria,
	FormContainer,
	CriteriaList,
	CriterionType,
	Operators
} from './criteriaField.styles';
import { renderWhenTrue } from '../../../helpers/rendering';
import { ButtonMenu } from '../buttonMenu/buttonMenu.component';
import { CRITERIA_LIST } from '../../../constants/criteria';
import { NewCriterionForm } from './newCriterionForm.component';

interface IProps {
	className?: string;
	value: any[];
	label?: string;
	criteria: any;
	onChange: (criteria) => void;
	onFormChange: (criterion) => void;
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
		}]
	};

	public componentDidMount() {
		if (this.props.value) {
			// this.setState({ selectedCriteria: this.props.value });
		}
	}

	public handleDelete = () => {

	}

	public handleSelect = () => {

	}

	public handleAddNew = () => {

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

	public renderCriteria = renderWhenTrue(() => (
		<ChipsContainer>
			{this.state.selectedCriteria.map(this.renderCriterion)}
		</ChipsContainer>
	));

	public renderOperators = () => (
		<CriteriaList subheader={<li />}>
			{CRITERIA_LIST.map(({ name, operators }) => (
				<CriterionType key={name}>
					<Operators>
						<ListSubheader>{name}</ListSubheader>
						{operators.map(({ label, operator }) => (
							<ListItem
								key={`${name}-${operator}`}
								onClick={this.handleSelect}
							>
								<ListItemText primary={label} />
							</ListItem>
						))}
					</Operators>
				</CriterionType>
			))}
		</CriteriaList>
	)

	public renderMenu = () => (
		<ButtonContainer>
			<ButtonMenu
				renderButton={MenuButton}
				renderContent={this.renderOperators}
				PaperProps={{ style: { overflow: 'initial', boxShadow: 'none' } }}
				PopoverProps={{ anchorOrigin: { vertical: 'center', horizontal: 'left' } }}
				ButtonProps={{ disabled: false }}
			/>
		</ButtonContainer>
	)

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
					{this.renderCriteria(!!this.state.selectedCriteria.length)}
					{this.renderMenu()}
				</SelectedCriteria>
				{this.renderForm()}
			</Container>
		);
	}
}

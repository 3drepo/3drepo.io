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

import React from 'react';

import { SubModelsTable } from './../subModelsTable/subModelsTable.component';
import { ModelsTableContainer } from './subModelsField.styles';

interface IProps {
	name: string;
	value: any[];
	onChange: (event) => void;
	onBlur: (event) => void;
	availableModels: any[];
	federatedModels: any[];
	selectedAvailableModels: any[];
	selectedFederatedModels: any[];
	availableIcon: any;
	federatedIcon: any;
	moveToFederated: () => void;
	moveToAvailable: () => void;
	handleSelectAllAvailableClick: (event) => void;
	handleSelectAvailableItemClick: (event) => void;
	handleSelectAllFederatedClick: (event) => void;
	handleSelectFederatedItemClick: (event) => void;
	checkboxDisabled: boolean;
}

interface IState {
	value: any[];
}

export class SubModelsField extends React.PureComponent<IProps, IState> {
	public state = {
		value: []
	};

	public componentDidMount() {
		this.setState({ value: this.props.value });
	}

	public componentDidUpdate(prevProps) {
		if (prevProps.federatedModels !== this.props.federatedModels) {
			this.setState({ value: this.props.federatedModels }, this.handleChange);
		}
	}

	public handleChange = () => {
		if (this.props.onChange) {
			this.props.onChange({
				target: {
					value: this.state.value,
					name: this.props.name
				}
			});
		}
	}

	public render() {
		const {
			availableModels, selectedAvailableModels,
			federatedModels, selectedFederatedModels,
			availableIcon, federatedIcon,
			moveToFederated, moveToAvailable,
			handleSelectAllAvailableClick, handleSelectAvailableItemClick,
			handleSelectAllFederatedClick, handleSelectFederatedItemClick,
			checkboxDisabled
		} = this.props;

		return (
			<ModelsTableContainer>
				<SubModelsTable
					title="Available"
					models={availableModels}
					selectedModels={selectedAvailableModels}
					handleIconClick={moveToFederated}
					Icon={availableIcon}
					handleAllClick={handleSelectAllAvailableClick}
					handleItemClick={handleSelectAvailableItemClick}
					checkboxDisabled={checkboxDisabled}
				/>
				<SubModelsTable
					title="Federated"
					models={federatedModels}
					selectedModels={selectedFederatedModels}
					handleIconClick={moveToAvailable}
					Icon={federatedIcon}
					handleAllClick={handleSelectAllFederatedClick}
					handleItemClick={handleSelectFederatedItemClick}
					checkboxDisabled={checkboxDisabled}
				/>
			</ModelsTableContainer>
		);
	}
}

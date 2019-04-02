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
import { capitalize } from 'lodash';
import { Checkbox, MenuItem } from '@material-ui/core';

import { TARGET_MODEL_TYPE, BASE_MODEL_TYPE } from '../../../../../../constants/compare';
import { Container, ClashTypeSwitch, ClashSettings, SelectField, Name, Model } from './compareClashItem.styles';
import { renderWhenTrue } from '../../../../../../helpers/rendering';
import { RevisionsSelect } from '../revisionsSelect/revisionsSelect.component';

enum ComparingType {
	TARGET_MODEL_TYPE,
	BASE_MODEL_TYPE
}

interface IProps {
	className?: string;
	name: string;
	revisions: any[];
	comparingType: string;
	selected?: boolean;
	onSelectionChange: (event) => void;
	onRevisionChange: () => void;
	onComparingTypeChange: (type) => void;
}

export class CompareClashItem extends React.PureComponent<IProps, any> {
	public static defaultProps = {
		selected: false,
		comparingType: BASE_MODEL_TYPE
	};

	private renderTypeSwitch = renderWhenTrue(() => {
		const { comparingType } = this.props;
		return (
			<ClashTypeSwitch
				value={comparingType}
				onClick={this.handleComparingTypeChange}
			>
				{capitalize(comparingType)}
			</ClashTypeSwitch>
		);
	});

	public render() {
		const { className, selected } = this.props;
		return (
			<Container className={className}	disabled={!selected}>
				{this.renderCheckbox()}
				{this.renderData()}
			</Container>
		);
	}

	private handleComparingTypeChange = () => {
		const { comparingType } = this.props;
		if (comparingType === BASE_MODEL_TYPE) {
			return TARGET_MODEL_TYPE;
		}
		return BASE_MODEL_TYPE;
	}

	private renderCheckbox = () => {
		const { onSelectionChange } = this.props;
		return (
			<Checkbox
				color="primary"
				onChange={onSelectionChange}
			/>
		);
	}

	private renderData = () => {
		const { name, selected } = this.props;
		return (
			<Model>
				<Name>{name}</Name>
				<ClashSettings>
					{this.renderRevisions()}
					{this.renderTypeSwitch(selected)}
				</ClashSettings>
			</Model>
		);
	}

	private renderRevisions = () => {
		const { revisions, selected } = this.props;
		return (
			<RevisionsSelect
				revisions={revisions}
				selected={selected}
			/>
		);
	}
}

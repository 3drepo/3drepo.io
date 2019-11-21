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

import { Checkbox } from '@material-ui/core';
import { capitalize } from 'lodash';
import React from 'react';

import { BASE_MODEL_TYPE, TARGET_MODEL_TYPE } from '../../../../../../constants/compare';
import { renderWhenTrue } from '../../../../../../helpers/rendering';
import { RevisionsSelect } from '../revisionsSelect/revisionsSelect.component';
import { ClashSettings, ClashTypeSwitch, Container, Model, Name, NoRevisionInfo } from './compareClashItem.styles';

interface IProps {
	className?: string;
	name: string;
	baseRevision: any;
	currentRevision: any;
	revisions: any[];
	isTarget: boolean;
	selected?: boolean;
	onSelectionChange: (event, selected) => void;
	onRevisionChange: (revision) => void;
	onModelTypeChange: (type) => void;
}

export class CompareClashItem extends React.PureComponent<IProps, any> {
	public static defaultProps = {
		selected: false,
		comparingType: BASE_MODEL_TYPE
	};

	get modelType() {
		return this.props.isTarget ? TARGET_MODEL_TYPE : BASE_MODEL_TYPE;
	}

	private renderTypeSwitch = renderWhenTrue(() => {
		return (
			<ClashTypeSwitch
				value={this.modelType}
				onClick={this.handleModelTypeChange}
			>
				{capitalize(this.modelType)}
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

	private handleModelTypeChange = () => {
		if (this.props.isTarget) {
			this.props.onModelTypeChange(BASE_MODEL_TYPE);
			return;
		}
		this.props.onModelTypeChange(TARGET_MODEL_TYPE);
	}

	private renderCheckbox = () => {
		const { onSelectionChange, selected } = this.props;
		return (
			<Checkbox
				checked={selected}
				color="primary"
				disabled={!this.props.baseRevision._id}
				onChange={onSelectionChange}
			/>
		);
	}

	private renderNoRevisionInfo = renderWhenTrue(() => (
			<NoRevisionInfo>No revision found</NoRevisionInfo>
	));

	private renderData = () => {
		const { name, selected } = this.props;
		return (
			<Model>
				<Name disabled={!selected}>{name}</Name>
				<ClashSettings>
					{this.renderRevisions(!!this.props.baseRevision._id)}
					{this.renderNoRevisionInfo(!this.props.baseRevision._id)}
					{this.renderTypeSwitch(selected)}
				</ClashSettings>
			</Model>
		);
	}

	private renderRevisions = renderWhenTrue(() => {
		const { revisions, selected, baseRevision, currentRevision, onRevisionChange } = this.props;

		return (
			<RevisionsSelect
				defaultValue={baseRevision._id}
				value={currentRevision._id}
				revisions={revisions}
				disabled={!selected || !this.props.isTarget}
				onChange={onRevisionChange}
			/>
		);
	});
}

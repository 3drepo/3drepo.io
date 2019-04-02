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

import { ArrowsAltH } from '../../../../../components/fontAwesomeIcon';
import Checkbox from '@material-ui/core/Checkbox';
import { RevisionsSelect } from '../revisionsSelect/revisionsSelect.component';
import { Container, ModelData, Name, Revisions, CurrentRevision } from './compareDiffItem.styles';
import { renderWhenTrue } from '../../../../../../helpers/rendering';

interface IProps {
	className?: string;
	name: string;
	baseRevision: string;
	currentRevision: string;
	revisions: any[];
	selected?: boolean;
	onSelectionChange: (event, selected) => void;
	onRevisionChange: () => void;
}

export class CompareDiffItem extends React.PureComponent<IProps, any> {
	public static defaultProps = {
		selected: false
	};

	public get currentRevisionName() {
		return this.getRevisionName(0);
	}

	public getRevisionName = (id) =>
		this.props.revisions[id].name || '(no name)'

	public renderRevisionsSettings = renderWhenTrue(() => (
		<>
			<ArrowsAltH />
			<RevisionsSelect
				defaultValue={this.props.baseRevision}
				value={this.props.currentRevision}
				revisions={this.props.revisions}
				disabled={!this.props.selected}
				onChange={this.props.onRevisionChange}
			/>
		</>
	));

	public render() {
		const { className, selected } = this.props;

		return (
			<Container className={className} disabled={!selected}>
				{this.renderCheckbox()}
				{this.renderModelData()}
			</Container>
		);
	}

	private renderCheckbox = () => {
		const { onSelectionChange, selected } = this.props;
		return (
			<Checkbox
				checked={selected}
				color="primary"
				onChange={onSelectionChange}
			/>
		);
	}

	private renderModelData = () => {
		const { name, selected } = this.props;
		return (
			<ModelData>
				<Name disabled={!selected}>{name}</Name>
				<Revisions>
					<CurrentRevision disabled={!selected}>{this.currentRevisionName}</CurrentRevision>
					{this.renderRevisionsSettings(this.props.selected && this.props.revisions.length > 1)}
				</Revisions>
			</ModelData>
		);
	}
}

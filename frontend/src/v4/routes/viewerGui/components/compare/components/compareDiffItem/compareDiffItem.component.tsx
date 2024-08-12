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

import { PureComponent } from 'react';

import { formatDateTime } from '@/v5/helpers/intl.helper';
import { renderWhenTrue } from '../../../../../../helpers/rendering';
import { ArrowsAltH } from '../../../../../components/fontAwesomeIcon';
import { RevisionsSelect } from '../revisionsSelect/revisionsSelect.component';
import {
	CompareIconWrapper,
	Container,
	CurrentRevision,
	ModelData,
	Name,
	Revisions,
	RevisionTooltip,
	Checkbox,
} from './compareDiffItem.styles';

interface IProps {
	className?: string;
	name: string;
	baseRevision: any;
	currentRevision: any;
	targetDiffRevision: any;
	revisions: any[];
	selected?: boolean;
	onSelectionChange: (event, selected) => void;
	onRevisionChange: (modelProps) => void;
}

export class CompareDiffItem extends PureComponent<IProps, any> {
	public static defaultProps = {
		selected: false
	};

	public get currentRevisionName() {
		if (this.props.baseRevision._id) {
			return this.props.baseRevision.tag || formatDateTime(this.props.baseRevision.timestamp);
		}
		return 'No revision found';
	}

	public renderRevisionsSettings = renderWhenTrue(() => (
		<>
			<CompareIconWrapper>
				<ArrowsAltH />
			</CompareIconWrapper>
			<RevisionsSelect
				baseRevision={this.props.baseRevision._id}
				defaultValue={this.props.targetDiffRevision._id}
				value={this.props.targetDiffRevision._id}
				revisions={this.props.revisions.filter(r => r._id !== this.props.baseRevision._id)}
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
		const { onSelectionChange, selected, revisions } = this.props;
		return (
			<Checkbox
				$hidden={revisions.length < 2}
				checked={selected}
				color="primary"
				disabled={!this.props.baseRevision._id}
				onChange={onSelectionChange}
			/>
		);
	}

	private renderModelData = () => {
		const { name, selected, revisions } = this.props;
		const canSelect = revisions.length > 1;
		const disabled = !canSelect || !selected;
		return (
			<ModelData>
				<Name disabled={disabled}>{name}</Name>
				<Revisions>
					<RevisionTooltip title={this.currentRevisionName} >
						<CurrentRevision disabled={disabled}>{this.currentRevisionName}</CurrentRevision>
					</RevisionTooltip>
					{this.renderRevisionsSettings(selected && canSelect)}
				</Revisions>
			</ModelData>
		);
	}
}

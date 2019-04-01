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
import * as dayjs from 'dayjs';

import { ArrowsAltH } from '../../../../../../components/fontAwesomeIcon';
import Checkbox from '@material-ui/core/Checkbox';

import { Container, ModelData, Name, Revisions, CurrentRevision } from './compareItem.styles';

interface IProps {
	className?: string;
	name: string;
	revisions: any[];
	selected?: boolean;
	onSelect: () => void;
	onDeselect: () => void;
	onRevisionChange: () => void;
}

export class CompareItem extends React.PureComponent<IProps, any> {
	public get revisionTag() {
		return this.props.revisions[0].tag || dayjs(this.props.revisions[0].timestamp).format('DD MMM YYYY');
	}

	public render() {
		return (
			<Container className={this.props.className}>
				<Checkbox
					color="primary"
					checked={this.props.selected}
					onChange={this.props.onRevisionChange}
				/>
				<ModelData>
					<Name>{this.props.name}</Name>
					<Revisions>
						<CurrentRevision>{this.revisionTag}</CurrentRevision>
						<ArrowsAltH />
					</Revisions>
				</ModelData>
			</Container>
		);
	}
}

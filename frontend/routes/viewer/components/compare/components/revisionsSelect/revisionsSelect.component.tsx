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

import { SelectField, MenuItem, Name, Date } from './revisionsSelect.styles';
import { renderWhenTrue } from '../../../../../../helpers/rendering';

interface IProps {
	revisions: any[];
	selected?: boolean;
}

export class RevisionsSelect extends React.PureComponent<IProps, any> {
	public static defaultProps = {
		selected: false
	};

	private renderSelect = renderWhenTrue(() => (
		<SelectField
			value={this.props.revisions[0].name}
			readOnly={this.props.revisions.length < 2}
			disabled={!this.props.selected}
			renderValue={() => this.renderName(this.props.revisions[0].name)}
		>
			{this.props.revisions.map(({ name, timestamp, _id }) => (
				<MenuItem key={_id} value={_id}>
					{this.renderName(name)}
					{this.renderDate(timestamp)}
				</MenuItem>
			))}
		</SelectField>
	));

	private renderDefaultRevision = renderWhenTrue(() => this.renderName(this.props.revisions[0].name));

	public render() {
		const { revisions } = this.props;
		return (
			<>
				{this.renderSelect(revisions.length > 1)}
				{this.renderDefaultRevision(revisions.length === 1)}
			</>
		);
	}

	private renderName = (name) => (<Name>{name || '(no name)'}</Name>);
	private renderDate = (timestamp) => (<Date value={timestamp} format="DD MMM YYYY" />);
}

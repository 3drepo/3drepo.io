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
import { keyBy, memoize } from 'lodash';

import { DateTime } from '../../../../../components/dateTime/dateTime.component';
import { renderWhenTrue } from '../../../../../../helpers/rendering';
import { SelectField, MenuItem, Name, Date } from './revisionsSelect.styles';

interface IProps {
	revisions: any[];
	value: string;
	defaultValue?: string;
	onChange: (revisionId) => void;
	disabled?: boolean;
}

export class RevisionsSelect extends React.PureComponent<IProps, any> {
	public static defaultProps = {
		disabled: false
	};

	get defaultValue() {
		const { defaultValue, revisions } = this.props;
		return defaultValue || revisions[0]._id;
	}

	get revisionsMap() {
		return keyBy(this.props.revisions, '_id');
	}

	get value() {
		const { value } = this.props;
		return this.revisionsMap[value || this.defaultValue].tag;
	}

	private renderSelect = renderWhenTrue(() => {
		const { revisions, disabled, value, defaultValue, onChange } = this.props;

		return (
			<SelectField
				value={value || defaultValue}
				readOnly={revisions.length < 2}
				disabled={disabled}
				renderValue={this.renderValue}
				onChange={onChange}
			>
				{revisions.map(({ tag, timestamp, _id }) => (
					<MenuItem key={_id} value={_id}>
						{this.renderName(tag)}
						{this.renderDate(timestamp)}
					</MenuItem>
				))}
			</SelectField>
		);
	});

	private renderDefaultValue = renderWhenTrue(() => this.renderName(this.revisionsMap[this.defaultValue].tag));

	public render() {
		const { revisions } = this.props;
		return (
			<>
				{this.renderSelect(revisions.length > 1)}
				{this.renderDefaultValue(revisions.length === 1)}
			</>
		);
	}

	private renderValue = () => this.renderName(this.value);

	private renderName = (name) => (<Name>{name || '(no name)'}</Name>);

	private renderDate = (timestamp) => (<Date><DateTime value={timestamp} format="DD MMM YYYY" /></Date>);
}

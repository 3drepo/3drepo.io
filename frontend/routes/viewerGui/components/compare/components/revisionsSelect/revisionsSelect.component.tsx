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

import { keyBy } from 'lodash';
import React from 'react';
import { renderWhenTrue } from '../../../../../../helpers/rendering';
import { formatShortDate, NAMED_MONTH_DATE_FORMAT } from '../../../../../../services/formatting/formatDate';
import { DateTime } from '../../../../../components/dateTime/dateTime.component';
import { RevisionTooltip } from '../compareDiffItem/compareDiffItem.styles';
import { Date, MenuItem, Name, SelectField } from './revisionsSelect.styles';

interface IProps {
	revisions: any[];
	value: string;
	baseRevision?: string;
	defaultValue?: string;
	disabled?: boolean;
	onChange: (revisionId) => void;
}

interface IState {
	value: string;
	tooltipHidden?: boolean;
}

export class RevisionsSelect extends React.PureComponent<IProps, IState> {
	get defaultValue() {
		const { defaultValue, revisions } = this.props;
		return defaultValue || revisions[0]._id;
	}

	get revisionsMap() {
		return keyBy(this.props.revisions, '_id');
	}

	get value() {
		return this.getRevisionName(this.revisionsMap[this.state.value]);
	}

	public static defaultProps = {
		disabled: false
	};

	public state = {
		value: null,
		tooltipHidden: false
	};

	private renderSelect = renderWhenTrue(() => {
		const { revisions, disabled } = this.props;

		return (
			<RevisionTooltip title={this.value} hidden={this.state.tooltipHidden}>
				<SelectField
					value={this.state.value}
					readOnly={revisions.length < 2}
					disabled={disabled}
					renderValue={this.renderValue}
					onChange={this.handleChange}
					MenuProps={({onEntered: this.handleOpen, onExit: this.handleClose})}
				>
					{revisions.map((revision) => (
						<MenuItem key={revision._id} value={revision}>
							{this.renderName(revision)}
							{this.renderDate(revision.timestamp)}
						</MenuItem>
					))}
				</SelectField>
			</RevisionTooltip>
		);
	});

	private renderDefaultValue = renderWhenTrue(() => this.renderName(this.revisionsMap[this.defaultValue]));

	public componentDidMount() {
		this.setState({
			value: this.props.value || this.props.defaultValue
		});
	}

	public componentDidUpdate(prevProps) {
		if (prevProps.value !== this.props.value) {
			this.setState({
				value: this.props.value || this.props.defaultValue
			});
		}
	}

	public render() {
		const { revisions } = this.props;

		return (
			<>
				{this.renderSelect(revisions.length > 1 && this.state.value)}
				{this.renderDefaultValue(revisions.length === 1)}
			</>
		);
	}

	private handleChange = (e) => {
		this.setState({
			value: e.target.value._id
		}, () => {
			this.props.onChange(e.target.value);
		});
	}

	private handleOpen = (e) => {
		this.setState({ tooltipHidden: true });
	}

	private handleClose = (e) => {
		this.setState({ tooltipHidden: false });
	}

	private getRevisionName = (revision) => {
		return revision.tag || formatShortDate(revision.timestamp);
	}

	private renderValue = () => (<Name>{this.value}</Name>);

	private renderName = (revision) => (<Name>{this.getRevisionName(revision)}</Name>);

	private renderDate = (timestamp) => (<Date><DateTime value={timestamp} format={NAMED_MONTH_DATE_FORMAT} /></Date>);
}

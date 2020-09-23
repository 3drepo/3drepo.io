/**
 *  Copyright (C) 2020 3D Repo Ltd
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
import CloseIcon from '@material-ui/icons/Close';
import SequencesIcon from '@material-ui/icons/Movie';

import DayJsUtils from '@date-io/dayjs';

import { Field } from 'formik';
import { MuiPickersUtilsProvider } from 'material-ui-pickers';
import { NAMED_MONTH_DATETIME_FORMAT } from '../../../services/formatting/formatDate';
import { DateField } from '../dateField/dateField.component';

interface IProps {
	canEdit: boolean;
	showSequenceDate: (date) => void;
}

interface IState {
	valued: any;
}

const SequenceDateField = ({value, name, onChange, showSequenceDate}) => {
	return (
		<>
			<DateField
				format={NAMED_MONTH_DATETIME_FORMAT}
				dateTime
				name={name}
				inputId={name}
				value={value}
				onChange={onChange}
			/>

			<SequencesIcon onClick={(e) => showSequenceDate(value)} />
			<CloseIcon onClick={(e) => {
				onChange({target: { value: null, name }});
			}} />
		</>
	);

};

export class SequencingDates extends React.PureComponent<IProps, IState> {
	public render() {
		return (
			<MuiPickersUtilsProvider utils={DayJsUtils}>
				<InputLabel shrink>Start time</InputLabel>
				<Field name="sequence_start" render={({ field }) => (
					<SequenceDateField
						{...field}
						showSequenceDate={this.props.showSequenceDate}
					/>
				)} />
			</MuiPickersUtilsProvider>
		);
	}
}

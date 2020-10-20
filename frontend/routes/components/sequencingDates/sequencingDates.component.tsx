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
import { isDateOusideRange } from '../../../helpers/dateTime';
import { NAMED_MONTH_DATETIME_FORMAT } from '../../../services/formatting/formatDate';
import { FieldsRow,
	StyledFormControl } from '../../viewerGui/components/risks/components/riskDetails/riskDetails.styles';
import { SmallIconButton } from '../smallIconButon/smallIconButton.component';
import { SequenceDateActions, SequenceDateContainer, SequenceDateField } from './sequencingDates.styles';

interface IProps {
	canEdit: boolean;
	min: number;
	max: number;
	showSequenceDate: (value) => void;
}

interface IState {
	valued: any;
}

const SequenceDate = ({value, name, onChange, showSequenceDate, min, max}) => {
	return (
		<SequenceDateContainer>
			<SequenceDateField
				shouldDisableDate={(date) => isDateOusideRange(min, max, date.$d)}
				format={NAMED_MONTH_DATETIME_FORMAT}
				dateTime
				name={name}
				inputId={name}
				value={value}
				onChange={onChange}
				defaultValue={min}
			/>
			{ value &&
				<SequenceDateActions>
					<SmallIconButton onClick={(e) => showSequenceDate(value)} Icon={SequencesIcon} />
					<SmallIconButton onClick={(e) => onChange({target: { value: null, name }})} Icon={CloseIcon} />
				</SequenceDateActions>
			}
		</SequenceDateContainer>
	);
};

export class SequencingDates extends React.PureComponent<IProps, IState> {
	public render() {
		return (
			<MuiPickersUtilsProvider utils={DayJsUtils}>
				<FieldsRow container justify="space-between" flex={1}>
					<StyledFormControl>
						<InputLabel shrink>Start time</InputLabel>
						<Field name="sequence_start" render={({ field, form }) => (
							<SequenceDate
								{...field}
								{...this.props}
								min={this.props.max ? Math.max(form.values.sequence_end || 0, this.props.max) : undefined}
							/>
						)} />
					</StyledFormControl>
				</FieldsRow>

				<FieldsRow container justify="space-between" flex={1}>
					<StyledFormControl>
						<InputLabel shrink>End time</InputLabel>
						<Field name="sequence_end" render={({ field, form }) =>  (
							<SequenceDate
								{...field}
								{...this.props}
								min={this.props.min ? Math.max(form.values.sequence_start || 0, this.props.min) : undefined}
							/>)
					} />
					</StyledFormControl>
				</FieldsRow>
			</MuiPickersUtilsProvider>
		);
	}
}

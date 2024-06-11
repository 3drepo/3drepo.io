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
import { PureComponent, useState } from 'react';
import InputLabel from '@mui/material/InputLabel';
import CloseIcon from '@mui/icons-material/Close';
import SequencesIcon from '@assets/icons/outlined/sequence_calendar-outlined.svg';
import { Field } from 'formik';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { createStructuredSelector } from 'reselect';
import { selectHasSequences } from '@/v4/modules/sequences';

import { isDateOutsideRange } from '../../../helpers/dateTime';
import { LONG_DATE_TIME_FORMAT_V5, NAMED_MONTH_DATETIME_FORMAT } from '../../../services/formatting/formatDate';
import {
	FieldsRow,
	StyledFormControl,
} from '../../viewerGui/components/risks/components/riskDetails/riskDetails.styles';
import { SmallIconButton } from '../smallIconButon/smallIconButton.component';
import { SequenceDateActions, SequenceDateContainer, SequenceDateField } from './sequencingDates.styles';

interface IProps {
	canEdit: boolean;
	min: number;
	max: number;
	showSequenceDate: (value) => void;
	selectedDate?: Date;
	endTimeValue?: Date;
	startTimeValue?: Date;
	startDate?: Date;
	hasSequences: boolean;
}

interface IState {
	valued: any;
}

const SequenceDate = ({ name, onChange, showSequenceDate, min, max, initialFocusedDate, hasSequences, canEdit, ...props }) => {
	const [value, setValue] = useState(props.value);
	const deleteValue = () => {
		onChange({target: { value: null, name }})
		setValue(null);
	};

	const handleChange = ({ target }) => {
		onChange({ target })
		setValue(target.value);
	};

	return (
		<SequenceDateContainer>
			<SequenceDateField
				shouldDisableDate={(date: any) => isDateOutsideRange(min, max, date.$d)}
				inputFormat={LONG_DATE_TIME_FORMAT_V5}
				dateTime
				name={name}
				value={value}
				onChange={handleChange}
				defaultValue={min}
				initialFocusedDate={initialFocusedDate}
				placeholder="Set time and date"
				disabled={!canEdit}
			/>
			{ value &&
				<SequenceDateActions>
					<SmallIconButton onClick={(e) => showSequenceDate(value)} Icon={SequencesIcon as any} disabled={!hasSequences} />
					<SmallIconButton onClick={deleteValue} Icon={CloseIcon} />
				</SequenceDateActions>
			}
		</SequenceDateContainer>
	);
};

export class BaseSequencingDates extends PureComponent<IProps, IState> {
	get additionalProps() {
		const { endTimeValue, startTimeValue, selectedDate, startDate } = this.props;
		const newTime = selectedDate ? selectedDate : endTimeValue;

		return !startTimeValue ? {
			initialFocusedDate: newTime ? newTime : startDate,
		} : {};
	}

	public render() {
		return (
			<>
				<FieldsRow container justifyContent="space-between" flex={1}>
					<StyledFormControl>
						<InputLabel shrink>Start time</InputLabel>
						<Field name="sequence_start" render={({ field, form }) => (
							<SequenceDate
								{...field}
								{...this.props}
								max={this.props.max ?
									new Date(Math.min(form.values.sequence_end || Number.POSITIVE_INFINITY, this.props.max))
									: undefined}
								{...this.additionalProps}
							/>
						)} />
					</StyledFormControl>
				</FieldsRow>

				<FieldsRow container justifyContent="space-between" flex={1}>
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
			</>
		);
	}
}

const mapStateToProps = createStructuredSelector({
	hasSequences: selectHasSequences,
});
export const SequencingDates = withRouter(connect(mapStateToProps)(BaseSequencingDates));

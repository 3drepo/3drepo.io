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

import React from 'react';

import { SequencingDates } from '../../../../../components/sequencingDates/sequencingDates.component';
import { Content } from '../riskDetails/riskDetails.styles';

interface IProps {
	active: boolean;
	canComment: boolean;
	formRef: any;
	isNewTicket: boolean;
	showSequenceDate: (value) => void;
	min: number;
	max: number;
	selectedDate?: Date;
	endTimeValue?: Date;
	startTimeValue?: Date;
	sequences?: any[];
}

export const SequencingFormTab: React.FunctionComponent<IProps> = ({
	active, canComment, showSequenceDate, min, max, selectedDate, endTimeValue, startTimeValue, sequences
}) => {
	const startDate = sequences ? sequences[0]?.startDate : undefined;

	return (
		<Content active={active}>
			<SequencingDates
				showSequenceDate={showSequenceDate}
				canEdit={canComment}
				min={min}
				max={max}
				selectedDate={selectedDate}
				endTimeValue={endTimeValue}
				startTimeValue={startTimeValue}
				startDate={startDate}
			/>
		</Content>
	);
};

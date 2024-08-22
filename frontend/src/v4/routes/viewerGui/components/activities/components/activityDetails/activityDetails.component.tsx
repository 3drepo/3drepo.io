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

import Grid from '@mui/material/Grid';
import { isString } from 'lodash';

import { formatDateTime } from '@/v5/helpers/intl.helper';
import { Loader } from '../../../../../components/loader/loader.component';
import { LoaderContainer } from '../../../viewerPanel/viewerPanel.styles';
import { TimeIcon } from '../timeIcon/';
import { Container, Row } from './activityDetails.styles';

interface IProps {
	isPending: boolean;
	activityDetails: { data: any[] };
	setSelectedDate: (value: number) => void;
}

const renderValue = (key, value, setSelectedDate) => {

	let found: any = false;
	let processedValue = value;
	let dateToSelect;

	if (isString(value)) {
		const epochRegex = /EPOCH::\d+/g;
		found = value.match(epochRegex);
	}

	if (found && found.length) {
		found.forEach((timestamp) => {
			dateToSelect = Number(timestamp.slice('EPOCH::'.length));
			processedValue = processedValue.replace(timestamp, formatDateTime(dateToSelect));
		});
	}

	return (
		<Grid item xs={6}>{processedValue} <TimeIcon name={dateToSelect ? undefined : key} value={dateToSelect || value} handleOnClick={setSelectedDate} /></Grid>
	);
}

export const ActivityDetails = ({ isPending, activityDetails, setSelectedDate }: IProps) => {

	if (isPending) {
		return (
			<LoaderContainer>
				<Loader />
			</LoaderContainer>
		);
	}

	return (
		<Container container direction="row" alignItems="center">
			{activityDetails.data.map(({value, key}) => (
				<Grid key={key} item xs={12} >
					<Row container justifyContent="center">
						<Grid item xs={6}>{key}</Grid>
						{renderValue(key, value, setSelectedDate)}
					</Row>
				</Grid>
			))}
		</Container>
	);
};

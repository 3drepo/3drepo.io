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

import Grid from '@material-ui/core/Grid';
import ActivitiesIcon from '@material-ui/icons/Movie';
import { map } from 'lodash';

import { LoaderContainer } from '../../../../../billing/billing.styles';
import { Loader } from '../../../../../components/loader/loader.component';
import { Container, Row, StyledIconButton } from './activityDetails.styles';

const DATE_FIELDS = ['Planned Start', 'Planned Finish', 'Actual Start', 'Actual Finish'];

const TimeIcon = ({ name, value, handleOnClick }) => {

	if (!DATE_FIELDS.includes(name)) {
		return null;
	}

	const handleOnIconClick = () => handleOnClick(value);

	return (
		<StyledIconButton onClick={handleOnIconClick}>
			<ActivitiesIcon />
		</StyledIconButton>
	);
};

export const ActivityDetails = ({ isPending, activityDetails, fetchSelectedFrame }) => {

	if (isPending) {
		return (
			<LoaderContainer>
				<Loader />
			</LoaderContainer>
		);
	}

	const { data } = activityDetails;
	return (
		<Container container direction="row" alignItems="center">
			{map(data, (value, key) => (
				<Grid key={key} item xs={12} >
					<Row container justify="center">
						<Grid item xs={6}>{key}</Grid>
						<Grid item xs={6}>{value} <TimeIcon name={key} value={value} handleOnClick={fetchSelectedFrame} /></Grid>
					</Row>
				</Grid>
			))}
		</Container>
	);
};

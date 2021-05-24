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

import { Grid, Tooltip } from '@material-ui/core';

import { formatShortDate } from '../../../../../../services/formatting/formatDate';
import { ViewerPanelContent } from '../../../viewerPanel/viewerPanel.styles';
import {
	SequenceDatesContainer,
	SequenceItemContainer,
	SequenceItemIcon,
	SequenceName,
} from '../../sequences.styles';

interface IProps {
	sequences: any;
	setSelectedSequence: (id: string) => void;
}

const SequenceItem = ({name, modelName, startDate, endDate, onClick}) => (
	<SequenceItemContainer onClick={onClick}>
		<Grid container direction="row" alignItems="center">
			<SequenceItemIcon />
			<Grid item>
				<Tooltip title={name}>
					<SequenceName>{name}</SequenceName>
				</Tooltip>
				<Grid item>{modelName}</Grid>
				<SequenceDatesContainer>
					<Grid item>Start: {formatShortDate(new Date(startDate))} </Grid>
					<Grid item>End: {formatShortDate(new Date(endDate))} </Grid>
				</SequenceDatesContainer>
			</Grid>
		</Grid>
	</SequenceItemContainer>
);

export class SequencesList extends React.PureComponent<IProps, {}> {
	public render = () => {
		const { setSelectedSequence, sequences } = this.props;

		return (
			<ViewerPanelContent>
				{sequences.map((sequence) => (
					<SequenceItem key={sequence._id} {...sequence} onClick={() => setSelectedSequence(sequence._id)} />
				))}
			</ViewerPanelContent>
		);
	}
}

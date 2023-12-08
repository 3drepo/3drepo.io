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

import { Grid, Tooltip } from '@mui/material';
import { Gap } from '@controls/gap';
import { Toggle } from '@controls/inputs/toggle/toggle.component';
import { FormattedMessage } from 'react-intl';

import { formatShortDate } from '../../../../../../services/formatting/formatDate';
import { ViewerPanelContent } from '../../../viewerPanel/viewerPanel.styles';
import {
	SequenceDatesContainer,
	SequenceItemContainer,
	SequenceItemIcon,
	SequenceName,
	ToggleContainer,
} from '../../sequences.styles';

interface IProps {
	sequences: any;
	setSelectedSequence: (id: string) => void;
	openOnToday: boolean;
	setOpenOnToday: (newValue: boolean) => void;
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

export const SequencesList = ({ setSelectedSequence, sequences, openOnToday, setOpenOnToday }: IProps) => (
	<ViewerPanelContent>
		{sequences.map((sequence) => (
			<SequenceItem key={sequence._id} {...sequence} onClick={() => setSelectedSequence(sequence._id)} />
		))}
		<Gap $height='48px' />
		<ToggleContainer>
			<Toggle onChange={() => setOpenOnToday(!openOnToday)} checked={openOnToday} />
			<FormattedMessage
				id="sequeneces.toggle.goToToday"
				defaultMessage="Go to today's date when entering a sequence"
			/>
		</ToggleContainer>
	</ViewerPanelContent>
);

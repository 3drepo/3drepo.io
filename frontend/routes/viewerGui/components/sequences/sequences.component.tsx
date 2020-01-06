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

import { SequencePlayer } from './components/sequencePlayer/sequencePlayer.component';
import {
	SequencesContainer, SequencesIcon,
} from './sequences.styles';

interface IProps {
	sequences: any;
}

export class Sequences extends React.PureComponent<IProps, {}> {
	public onChangeDate(value) {
	}

	public render() {
		const min = new Date('December 17, 2018 03:24:00');
		const max = new Date('December 30, 2020 03:24:00');

		return (
			<SequencesContainer
				Icon={<SequencesIcon />}
				renderActions={() => (<></>)}
				pending={false}
			>
				<SequencePlayer min={min} max={max} onChange={this.onChangeDate} />
			</SequencesContainer>
	);
	}
}

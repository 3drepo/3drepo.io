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
import { formatShortDate } from '../../../../../../services/formatting/formatDate';

interface IProps {
	sequences: any;
	setSelectedSequence: (id: string) => void;
}

const SequenceItem = ({name, _id, model, minDate, maxDate, onClick}) => (
	<div onClick={onClick}>
		<div>{name}</div>
		<div>Start: {formatShortDate(new Date(minDate))} </div>
		<div>End: {formatShortDate(new Date(maxDate))} </div>
	</div>
);

export class SequencesList extends React.PureComponent<IProps, {}> {
	public render = () => {
		const {setSelectedSequence, sequences} = this.props;

		return (
			<div>
				{sequences.map((sequence) => (
					<SequenceItem key={sequence._id} {...sequence} onClick={() => setSelectedSequence(sequence._id)} />
				))}
			</div>
		);
	}
}

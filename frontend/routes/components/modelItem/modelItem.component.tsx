/**
 *  Copyright (C) 2017 3D Repo Ltd
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

import { Highlight } from '../highlight/highlight.component';
import { Container, Detail, Name } from './modelItem.styles';

interface IProps {
	name: string;
	isFederation?: boolean;
	searchText?: string;
}

export const ModelItem = ({name, isFederation, searchText = ''}: IProps) => {
	const highlightProps = {
		search: searchText || ''
	};

	return (
		<Container>
			<Name>
				<Highlight
					search={searchText}
					text={name}
				/>
			</Name>
			<Detail>
				<Highlight
					search={searchText}
					text={isFederation ? 'Federation' : 'Model'}
				/>
			</Detail>
		</Container>
	);
};

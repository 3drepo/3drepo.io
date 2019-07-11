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

import { upperCase } from 'lodash';
import * as React from 'react';

import Grid from '@material-ui/core/Grid';
import { Highlight } from '../highlight/highlight.component';
import { Detail, Name } from './userItem.styles';

interface IProps {
	firstName?: string;
	lastName?: string;
	user?: string;
	company?: string;
	searchText?: string;
}

export const UserItem = (props: IProps) => {
	const highlightProps = {
		search: props.searchText || ''
	};

	return (
		<Grid
			container={true}
			direction="column"
			justify="center"
			alignItems="flex-start"
		>
			<Name item={true}>
				<Highlight
					{...highlightProps}
					text={`${upperCase(props.lastName)}, ${props.firstName}`}
				/>
			</Name>
			<Detail item={true}>
				<Highlight
					{...highlightProps}
					text={props.user}
				/>
			</Detail>
			<Detail item={true}>
				<Highlight
					{...highlightProps}
					text={props.company || ''}
				/>
			</Detail>
		</Grid>
	);
};

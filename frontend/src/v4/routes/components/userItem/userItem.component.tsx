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

import Grid from '@mui/material/Grid';
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
			container
			direction="column"
			justifyContent="center"
			alignItems="flex-start"
			style={{minWidth: 0}}
		>
			<Name item>
				<Highlight
					{...highlightProps}
					text={`${props.firstName} ${props.lastName}`}
				/>
			</Name>
			<Detail item>
				<Highlight
					{...highlightProps}
					text={props.company || ''}
				/>
			</Detail>
		</Grid>
    );
};

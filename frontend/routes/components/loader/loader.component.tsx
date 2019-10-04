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

import CircularProgress from '@material-ui/core/CircularProgress';
import React from 'react';

import { Container, Content } from './loader.styles';

interface IProps {
	content?: string;
	size?: number;
	horizontal?: boolean;
}

export const Loader = (props: IProps) => {
	const styleProps = {
		horizontal: props.horizontal
	};

	return (
		<Container {...styleProps}>
			<CircularProgress size={props.size || 30} />
			<Content {...styleProps}>
				{props.content}
			</Content>
		</Container>
	);
};

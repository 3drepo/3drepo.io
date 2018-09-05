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
import * as PropTypes from 'prop-types';

import { theme } from '../../../styles';
import { ButtonContainer } from './reactButton.styles';

interface IProps {
	text: string;
}

export class ReactButton extends React.PureComponent<IProps, any> {
	public static propTypes = {
		text: PropTypes.string
	};

	public render() {
		return (
			<ButtonContainer variant="raised">{this.props.text}</ButtonContainer>
		);
	}
}

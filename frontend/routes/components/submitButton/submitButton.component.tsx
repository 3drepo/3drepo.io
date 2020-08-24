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

import CircularProgress from '@material-ui/core/CircularProgress';
import { merge } from 'lodash';

import { LoaderContainer, StyledButton } from './submitButton.styles';

interface IProps {
	children: any;
	pending?: boolean;
	disabled?: boolean;
}

export const SubmitButton = ({ pending, disabled, children, ...props}: IProps) => {
	const additionalProps = merge({
		type: 'submit',
		variant: 'raised',
		color: 'secondary',
	}, props);

	return (
		<StyledButton
			disabled={pending || disabled}
			{...additionalProps}
		>
			{children}
			{pending && (
				<LoaderContainer>
					<CircularProgress size={16} />
				</LoaderContainer>
			)}
		</StyledButton>
	);
};

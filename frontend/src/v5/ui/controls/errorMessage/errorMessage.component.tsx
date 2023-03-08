/**
 *  Copyright (C) 2022 3D Repo Ltd
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
import CrossIcon from '@assets/icons/outlined/cross_sharp_edges-outlined.svg';
import { Typography } from '@controls/typography';
import { Gap } from '@controls/gap';
import { Container } from './errorMessage.styles';
import { IconContainer } from '../successMessage/successMessage.styles';

type ErrorMessageProps = {
	title?: string,
	className?: string,
	children?: any,
};
export const ErrorMessage = ({ title, children, className }: ErrorMessageProps) => (
	<Container className={className}>
		<IconContainer>
			<CrossIcon />
		</IconContainer>
		{title && (
			<Typography variant="h5">
				{title}
			</Typography>
		)}
		{title && children && (<span />)}
		{children && (
			<div>
				<Typography variant="body1">{children}</Typography>
				<Gap $height="10px" />
			</div>
		)}
	</Container>
);

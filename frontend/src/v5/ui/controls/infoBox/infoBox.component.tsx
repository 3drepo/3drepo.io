/**
 *  Copyright (C) 2024 3D Repo Ltd
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


import { Box, InfoIcon, TitleBar, Description, CloseIconContainer, Container } from './infoBox.styles';
import CloseIcon from '@assets/icons/outlined/cross-outlined.svg';

export type InfoBoxProps = {
	title: any,
	description: any,
	onClickClose: () => void,
	className?: string,
};
export const InfoBox = ({ title, description, onClickClose, className }: InfoBoxProps) => (
	<Container className={className}>
		<Box>
			<InfoIcon />
			<TitleBar>
				<div>{title}</div>
				<CloseIconContainer onClick={onClickClose}>
					<CloseIcon />
				</CloseIconContainer>
			</TitleBar>
			<span />
			<Description>{description}</Description>
		</Box>
	</Container>
);

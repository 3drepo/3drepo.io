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

import { ReactNode } from 'react';
import { Actions, CardHeaderContainer, Title } from './card.styles';

type CardHeaderProps = {
	icon: ReactNode;
	title: ReactNode | string;
	actions?: ReactNode;
};
export const CardHeader = ({ icon, title, actions }: CardHeaderProps) => (
	<CardHeaderContainer>
		{icon}
		<Title>{title}</Title>
		<Actions>{actions}</Actions>
	</CardHeaderContainer>
);
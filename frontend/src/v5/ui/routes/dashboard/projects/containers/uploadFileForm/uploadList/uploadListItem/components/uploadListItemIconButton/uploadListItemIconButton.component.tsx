/**
 *  Copyright (C) 2021 3D Repo Ltd
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
import { Container } from './uploadListItemIconButton.styles';

type IUploadListItemIconButton = {
	children: JSX.Element;
	noStroke?: boolean;
	onClick: () => void;
};

export const UploadListItemIconButton = ({
	noStroke = false,
	onClick,
	children,
}: IUploadListItemIconButton): JSX.Element => (
	<Container onClick={onClick} className={noStroke && 'no-stroke'} variant="main">
		{children}
	</Container>
);

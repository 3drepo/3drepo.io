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

import React, { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { MAIN_HEADER_PORTAL_TARGET_ID } from '../../routes/dashboard/index.constants';
import { Container, Bar } from './mainHeader.styles';

type IMainHeader = {
	children: ReactNode;
};

export const MainHeader = ({ children }: IMainHeader): JSX.Element => {
	const rootElement = document.getElementById(MAIN_HEADER_PORTAL_TARGET_ID);

	if (rootElement === null) {
		return null;
	}

	return createPortal(
		<Container>
			<Bar>
				{children}
			</Bar>
		</Container>,
		rootElement,
	);
};

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

import { useRouteMatch } from 'react-router-dom';

import { LegalContent, Container } from './legalLayout.styles';
import { LegalAppBar } from './legalAppBar/legalAppBar.component';
import { LegalPageParams } from '@/v5/ui/routes/routes.constants';

type ILegalLayout = {
	children: any;
};

export const LegalLayout = ({ children }: ILegalLayout) => {
	const { params: { legalPage } } = useRouteMatch<LegalPageParams>('/v5/:legalPage');
	return (
		<>
			<LegalAppBar activePage={legalPage} />
			<Container>
				<LegalContent>
					{children}
				</LegalContent>
			</Container>
		</>
	);
};

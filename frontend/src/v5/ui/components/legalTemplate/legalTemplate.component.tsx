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

import { useEffect, useState } from 'react';
import { useRouteMatch } from 'react-router-dom';

import { ScrollArea } from '@controls/scrollArea';
import { LegalAppBar } from './legalAppBar';
import { LegalContent } from './legalTemplate.styles';

export const LegalTemplate = () => {
	const [innerHtml, setInnerHtml] = useState('Loading...');
	const { params: { legalPage } } = useRouteMatch('/v5/:legalPage');
	const { legal: LEGAL_PAPERS } = ClientConfig;
	const { fileName } = LEGAL_PAPERS.find((paper) => paper.page === legalPage);

	const loadHtml = async () => {
		const { default: url } = await import(`@/v5/legal/${fileName}`);
		setInnerHtml(await url);
	};

	useEffect(() => {
		if (legalPage) loadHtml();
	}, [legalPage]);

	return (
		<>
			<LegalAppBar />
			<ScrollArea>
				<LegalContent>
					{/* eslint-disable-next-line react/no-danger */}
					<div dangerouslySetInnerHTML={{ __html: innerHtml }} />
				</LegalContent>
			</ScrollArea>
		</>
	);
};

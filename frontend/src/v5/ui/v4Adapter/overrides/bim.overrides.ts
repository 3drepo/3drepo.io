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

import { Tabs, Container } from '@/v4/routes/viewerGui/components/bim/bim.styles';
import { Title, Data, Header, Actions } from '@/v4/routes/viewerGui/components/bim/components/metaRecord/metaRecord.styles';
import { css } from 'styled-components';

export default css`
	${Tabs} {
		height: 43px;
		button {
			height: 43px;
 			box-sizing: content-box;
			font-size: 13px;
			padding: 0 0 12px;
			margin: 0 16px;
		}
	}

	${Container} {
		${Header} {
			${Title} {
				color: ${({ theme }) => theme.palette.secondary.main};
			}
			${Data} {
				color: ${({ theme }) => theme.palette.base.main};
				${Actions} {
					button {
						padding: 0;
						margin: 7px;
						svg {
							color: ${({ theme }) => theme.palette.base.main};
							max-width: 15px;
							max-height: 15px;
						}
					}
				}
			}
		}
	}
`;

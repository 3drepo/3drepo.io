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

import 'styled-components';
import { palette, typography } from './theme';

interface IGradient {
	main: string;
	secondary: string;
}

interface IShadow {
	level_1: string;
	level_2: string;
	level_3: string;
	level_4: string;
	level_5: string;
	level_6: string;
	level_7: string;
	level_8: string;
	level_9: string;
	level_10: string;
}

type TypographyInterface = { fontFamily: string } & {
	[K in keyof typeof typography]: {
		[P in keyof typeof typography[K]]: P extends 'textTransform' ? any : typeof typography[K][P];
	};
};

declare module 'styled-components' {
	interface DefaultTheme {
		palette: typeof palette,
		typography: TypographyInterface,
	}
}

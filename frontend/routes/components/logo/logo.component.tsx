/**
 *  Copyright (C) 2017 3D Repo Ltd
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

import * as React from 'react';

// @ts-ignore
import * as DEFAULT_LOGO from '../../../images/3drepo-logo-white.png';
import { Image } from './logo.styles';

interface IProps {
	src?: string;
	alt?: string;
	onClick?: () => void;
}

const logoProps = {
	src: `${DEFAULT_LOGO}`,
	alt: '3D Repo',
	longdesc: '3DRepoBuildingInformationModellingSoftware'
};

export const Logo = (props: IProps) => <Image {...logoProps} {...props} />;

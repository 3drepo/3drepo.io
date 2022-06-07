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
import { isV5 } from '@/v4/helpers/isV5';

type ConditionalV5WrapperProps = {
	children: any;
	v5Wrapper: any;
	v5WrapperProps?: any;
	v4Wrapper?: any;
	v4WrapperProps?: any;
};

// If the version is v5, use the v5 wrapper.
// Otherwise, use the v4 wrapper if passed or just render the children.
export const ConditionalV5Wrapper = ({
	children,
	v5Wrapper: V5Wrapper,
	v5WrapperProps,
	v4Wrapper: V4Wrapper,
	v4WrapperProps,
}: ConditionalV5WrapperProps) => {
	// If the version is v5, use the v5 wrapper.
	if (isV5()) {
		return <V5Wrapper {...v5WrapperProps}>{children}</V5Wrapper>;
	}

	// If the version is v4, use the v4 wrapper if passed or just render the children.
	return V4Wrapper ? <V4Wrapper {...v4WrapperProps}>{children}</V4Wrapper> : children;
};

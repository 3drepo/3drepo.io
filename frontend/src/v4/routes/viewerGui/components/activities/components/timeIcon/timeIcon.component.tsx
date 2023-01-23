/**
 *  Copyright (C) 2020 3D Repo Ltd
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
import MovieIcon from '@mui/icons-material/Movie';
import PlayIcon from '@assets/icons/filled/play-filled.svg';

import { DATE_FIELDS } from './timeIcon.constants';
import { StyledIconButton } from './timeIcon.styles';

interface IProps {
	name: string;
	value: number;
	handleOnClick: (value: number) => void;
}

export const TimeIcon = ({ name, value, handleOnClick }: IProps) => {
	if (name && !DATE_FIELDS.includes(name)) {
		return null;
	}

	const handleOnIconClick = () => handleOnClick(value);

	return (
		<StyledIconButton onClick={handleOnIconClick}>
			{isV5() ? <PlayIcon /> : <MovieIcon />}
		</StyledIconButton>
	);
};

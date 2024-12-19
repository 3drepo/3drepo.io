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

import { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { RangeContainer } from './rangeInput.styles';
import { useFormContext } from 'react-hook-form';
import { get } from 'lodash';

export const RangeInput = ({ Input, name, error }) => {
	const { trigger, formState: { dirtyFields } } = useFormContext();

	useEffect(() => {
		const dirty = get(dirtyFields, name);
		if (dirty?.[0] || dirty?.[1]) {
			trigger(name);
		}
	}, [error?.[0]?.message, error?.[1]?.message]);

	return (
		<RangeContainer>
			<Input name={`${name}.0`} formError={!!error} />
			<FormattedMessage id="rangeInputs.to" defaultMessage="to" />
			<Input name={`${name}.1`} formError={!!error} />
		</RangeContainer>
	);
};
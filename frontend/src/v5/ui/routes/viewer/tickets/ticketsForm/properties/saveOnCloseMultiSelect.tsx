/**
 *  Copyright (C) 2025 3D Repo Ltd
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

import { ReactElement, useEffect, useState, type JSX } from 'react';

type MultiSelectPropertyProps = { value?: any; onClear?: () => void; onChange?: (event) => void; onBlur?: () => void; onClose?: (e) => void; };
export const useSaveOnCloseMultiSelectProps = <P extends MultiSelectPropertyProps>({ value, onChange, onBlur, onClose, ...props }: P) => {
	const [displayValue, setDisplayValue] = useState(value);

	const handleClose = (e: any) => {
		if (value?.length || displayValue?.length) {
			onChange?.({ target: { value: displayValue } });
			onBlur?.();
		}
		onClose?.(e);
	};

	const handleChange = (e: any) => setDisplayValue(e?.target?.value);

	const handleClear = () => {
		onChange?.({ target: { value: [] } });
		onBlur?.();
	};

	useEffect(() => setDisplayValue(value), [value]);

	return {
		...props,
		value: displayValue || [],
		onClose: handleClose,
		onChange: handleChange,
		onClear: handleClear,
	} as unknown as P & MultiSelectPropertyProps;
};

export const SaveOnCloseMultiSelectWrapper = <P extends MultiSelectPropertyProps>(Component: (props: P) => JSX.Element) => (props: P): ReactElement<any> => {
	const saveOnCloseProps = useSaveOnCloseMultiSelectProps(props);
	return <Component {...saveOnCloseProps} />;
};

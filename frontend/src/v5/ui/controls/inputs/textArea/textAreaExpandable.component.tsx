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

import { FormControl, FormHelperText, InputLabel, InputProps, InputBase } from '@mui/material';
import { FormInputProps } from '@controls/inputs/inputController.component';
import { Container, InputContainer, ShowMoreButton } from './textAreaExpandable.styles';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FormattedMessage } from 'react-intl';

export type TextAreaExpandableProps = FormInputProps & InputProps & {
	height?: number,
};

export const TextAreaExpandable = ({
	error,
	helperText,
	name,
	required,
	disabled,
	label,
	value = '', // this is to be certain that is a controlled field
	height = 80,
	className,
	...props
}: TextAreaExpandableProps) => {
	const [autoHeight, setAutoHeight] = useState(false);
	const [canCollapse, setCanCollapse] = useState(true);
	const ref = useRef<HTMLDivElement>(null);
	const [observer, setObserver] = useState<ResizeObserver>();

	const calculateCanCollapse = useCallback((entries: ResizeObserverEntry[]) => {
		const h = Number(getComputedStyle(entries[0].target).height.replace('px', ''));
		const newCanCollapse = h > height;
		if (newCanCollapse !== canCollapse) {
			if (newCanCollapse) {
				setAutoHeight(false);
			}
			setCanCollapse(newCanCollapse);
		}
	}, [height, setCanCollapse, canCollapse]);

	useEffect(() => {
		if (observer) {
			observer.disconnect();
		}
		if (ref.current) {
			const newObserver = new ResizeObserver(calculateCanCollapse);
			newObserver.observe(ref.current);
			setObserver(newObserver);
		}
	}, [ref.current, calculateCanCollapse]);

	return (
		<FormControl required={required} disabled={disabled} error={error} className={className}>
			{label && (
				<InputLabel id={`${name}-label`}>
					{label}
				</InputLabel>
			)}
			<Container $error={error}>
				<InputContainer $height={height} $autoHeight={autoHeight} $canCollapse={canCollapse}>
					<InputBase
						id={name}
						multiline
						minRows={4}
						{...props}
						value={value}
						ref={ref}
						defaultValue={undefined} // this is to be certain that is a controlled field
					/>
				</InputContainer>
				{canCollapse && (
					<ShowMoreButton onClick={() => setAutoHeight(!autoHeight)} onBlur={(e) => e.stopPropagation()}> 
						{!autoHeight
							? <FormattedMessage id="textarea.showMore" defaultMessage="Show more" />
							: <FormattedMessage id="textarea.showLess" defaultMessage="Show less" />
						}
					</ShowMoreButton>
				)}
			</Container>
			<FormHelperText>{helperText}</FormHelperText>
		</FormControl>
	);
};

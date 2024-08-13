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
import { useFormState } from 'react-hook-form';
import { Description, OptionContainer, StatusCodeInput, Value } from './uploadListItemStatusCode.styles';
import { ErrorTooltip } from '@controls/errorTooltip';
import { get } from 'lodash';
import { OptionsBox } from '@components/shared/uploadFiles/uploadList/uploadListItem/uploadListItemDestination/uploadListItemDestination.styles';
import { DrawingRevisionsHooksSelectors } from '@/v5/services/selectorsHooks';
import { StatusCode } from '@/v5/store/drawings/revisions/drawingRevisions.types';
import { Autocomplete } from '@mui/material';

interface IUploadListItemStatusCode {
	value?: string;
	onChange?: (val: any) => void;
	name: string;
	disabled?: boolean;
	className?: string;
	inputRef?: any;
}
export const UploadListItemStatusCode = ({ value, inputRef, onChange, ...props }: IUploadListItemStatusCode) => {
	const { errors } = useFormState();
	const error = get(errors, props.name)?.message;
	const options = DrawingRevisionsHooksSelectors.selectStatusCodes();
	const getValue = () => options.find((o) => o.code === value) || '';

	return (
		<Autocomplete
			{...props}
			options={options as StatusCode[]}
			autoHighlight
			value={getValue()}
			onChange={(e, newValue: StatusCode) => onChange(newValue?.code || '')}
			getOptionLabel={(option: StatusCode) => option.code || ''}
			renderOption={(optionProps, option: StatusCode) => (
				<OptionContainer {...optionProps} key={option.code}>
					<Value>{option.code}</Value>
					<Description>{option.description}</Description>
				</OptionContainer>
			)}
			renderInput={({ InputProps, ...params }) => (
				<StatusCodeInput
					{...params}
					InputProps={{
						...InputProps,
						startAdornment: !!error && (<ErrorTooltip>{error}</ErrorTooltip>),
					}}
					inputRef={inputRef}
					error={!!error}
				/>
			)}
			ListboxComponent={OptionsBox}
			disableClearable={!value}
		/>
	);
};
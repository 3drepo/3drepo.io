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
import { Autocomplete, Description, OptionContainer, StatusCodeInput, Value } from './uploadListItemStatusCode.styles';
import { ErrorTooltip } from '@controls/errorTooltip';
import { OptionsBox } from '@components/shared/uploadFiles/uploadList/uploadListItem/uploadListItemDestination/uploadListItemDestination.styles';
import { DrawingRevisionsHooksSelectors } from '@/v5/services/selectorsHooks';
import { StatusCode } from '@/v5/store/drawings/revisions/drawingRevisions.types';
import { Tooltip } from '@mui/material';

interface IUploadListItemStatusCode {
	value?: string;
	onChange?: (val: any) => void;
	name: string;
	disabled?: boolean;
	className?: string;
	inputRef?: any;
	helperText?: string,
	error?: boolean,
}
export const UploadListItemStatusCode = ({ value, inputRef, onChange, helperText, error, ...props }: IUploadListItemStatusCode) => {
	const options = DrawingRevisionsHooksSelectors.selectStatusCodes();
	const getValue = () => options.find((o) => o.code === value) || null;

	return (
		<Autocomplete
			{...props}
			options={options as StatusCode[]}
			autoHighlight
			value={getValue()}
			onChange={(e, newValue: StatusCode) => onChange(newValue?.code || '')}
			getOptionLabel={(option: StatusCode) => option.code || ''}
			renderOption={(optionProps, option: StatusCode) => (
				<Tooltip title={option.description} key={option.code}>
					<OptionContainer {...optionProps}>
						<Value>{option.code}</Value>
						<Description>{option.description}</Description>
					</OptionContainer>
				</Tooltip>
			)}
			renderInput={({ InputProps, ...params }) => (
				<StatusCodeInput
					{...params}
					InputProps={{
						...InputProps,
						startAdornment: error && (<ErrorTooltip>{helperText}</ErrorTooltip>),
					}}
					inputRef={inputRef}
					error={error}
				/>
			)}
			ListboxComponent={OptionsBox}
			disableClearable={!value}
		/>
	);
};
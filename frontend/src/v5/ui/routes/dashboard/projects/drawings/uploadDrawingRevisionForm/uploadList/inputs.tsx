/**
 *  Copyright (C) 2023 3D Repo Ltd
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

import { TextField as TextFieldBase, TextFieldProps } from '@mui/material';
import { forwardRef } from 'react';

// These inputes are temporal. We are using them for the upload form for improved performance. With more testing 
// we should replace the ones in  frominputs
type Props = TextFieldProps & {
	formError?: any
};

export const TextField:(props: Props) =>  JSX.Element = forwardRef(({ formError, ...props }:Props, ref)=> {
	return <TextFieldBase 
		{...props} 
		inputRef={ref}
		error={!!formError}
		helperText={formError?.message}
	/>;
});
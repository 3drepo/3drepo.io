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

import { useEffect, useState, type JSX } from 'react';

import { InputAdornment } from '@mui/material';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { formatMessage } from '@/v5/services/intl';
import {
	LinkBar,
	CopyToClipboardIconContainer,
	CopyToClipboardIcon,
	CopyToClipboardTooltip,
	CopiedToClipboardTooltip,
} from './shareTextField.styles';
import TickIcon from '@assets/icons/outlined/tick-outlined.svg';

type IShareTextField = {
	/**
	 * The label on top of the control
	 */
	label: string | JSX.Element,

	/**
	 * the value to be copied
	 */
	value: string,
	hideValue?: boolean,
	className?: string,
	disabled?: boolean,
};

const IS_COPYING_DURATION_MS = 3000;

export const ShareTextField = ({ label, value, className, hideValue, disabled = false }: IShareTextField) => {
	const [timeoutId, setTimeoutId] = useState(0);
	const [isCopying, setIsCopying] = useState(true);

	const handleCopyToClipboard = () => {
		if (!isCopying || disabled) return;

		setIsCopying(false);
		setTimeoutId(window.setTimeout(() => {
			setIsCopying(true);
		}, IS_COPYING_DURATION_MS));
	};

	useEffect(() => () => clearTimeout(timeoutId), [timeoutId]);

	return (
		<>
			<CopyToClipboard
				onCopy={handleCopyToClipboard}
				text={value}
				disabled={disabled}
			>
				<LinkBar
					disabled={disabled}
					value={value}
					label={label}
					className={className}
					{...(hideValue ? { type: 'password' } : {})}
					InputProps={{
						readOnly: true,
						endAdornment:
							disabled ? null : (
								<InputAdornment position="end">
									{isCopying
										? (
											<CopyToClipboardTooltip
												title={formatMessage({
													id: 'shareTextField.copyToClipboard',
													defaultMessage: 'Copy to clipboard',
												})}
											>
												<CopyToClipboardIconContainer>
													<CopyToClipboardIcon />
												</CopyToClipboardIconContainer>
											</CopyToClipboardTooltip>
										) : (
											<CopiedToClipboardTooltip
												title={formatMessage({
													id: 'shareTextField.copied',
													defaultMessage: 'Copied to clipboard',
												})}
												open
											>
												<CopyToClipboardIconContainer>
													<TickIcon />
												</CopyToClipboardIconContainer>
											</CopiedToClipboardTooltip>
										)}
								</InputAdornment>
							),
					}}
				/>
			</CopyToClipboard>
		</>
	);
};

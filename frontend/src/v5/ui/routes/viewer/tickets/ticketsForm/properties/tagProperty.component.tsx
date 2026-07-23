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

import { useRef, useState } from 'react';
import { FormInputProps } from '@controls/inputs/inputController.component';
import CloseIcon from '@assets/icons/outlined/close-outlined.svg';
import { FormattedMessage } from 'react-intl';
import { ChipContainer, DeleteButton } from '@components/viewer/cards/cardFilters/filterChip/filterChip.styles';
import { ChipsInputBox, FieldHint, HelperText, Kbd, Label, TagInput, TagPropertyContainer } from './tagProperty.styles';

type TagPropertyProps = FormInputProps & {
	value: string[];
	immutable?: boolean;
};

export const TagProperty = ({ value, onChange, onBlur, disabled, immutable, required, label, error, helperText }: TagPropertyProps) => {
	const tags = Array.isArray(value) ? value : [];
	const [inputValue, setInputValue] = useState('');
	const [focused, setFocused] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);

	const isEditable = !disabled && !immutable;

	const commitTag = (raw: string) => {
		const tag = raw.trim().replace(/,+$/, '');
		if (!tag || tags.includes(tag)) return;
		onChange?.({ target: { value: [...tags, tag] } } as any);
		onBlur?.();
	};

	const removeTag = (tag: string) => {
		onChange?.({ target: { value: tags.filter((v) => v !== tag) } } as any);
		onBlur?.();
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter' || e.key === ',') {
			e.preventDefault();
			commitTag(inputValue);
			setInputValue('');
		} else if (e.key === 'Backspace' && !inputValue && tags.length) {
			removeTag(tags[tags.length - 1]);
		}
	};

	const handleBlur = () => {
		if (inputValue.trim()) {
			commitTag(inputValue);
			setInputValue('');
		}
		setFocused(false);
	};

	const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
		e.preventDefault();
		const text = e.clipboardData.getData('text');
		text.split(/[,\n]+/).forEach((part) => commitTag(part));
		setInputValue('');
	};

	return (
		<TagPropertyContainer onClick={() => inputRef.current?.focus()}>
			{label && <Label shrink={false}>{label}</Label>}
			<ChipsInputBox selected={focused} error={error} disabled={disabled} required={required}>
				{tags.map((val) => (
					<ChipContainer key={val} selected={false}>
						<span>{val}</span>
						{isEditable && (
							<DeleteButton onClick={(e) => { e.stopPropagation(); removeTag(val); }}>
								<CloseIcon />
							</DeleteButton>
						)}
					</ChipContainer>
				))}
				{isEditable && (
					<TagInput
						ref={inputRef}
						value={inputValue}
						onChange={(e) => setInputValue(e.target.value)}
						onKeyDown={handleKeyDown}
						onPaste={handlePaste}
						onFocus={() => setFocused(true)}
						onBlur={handleBlur}
						placeholder={!tags.length ? 'New tag…' : ''}
					/>
				)}
			</ChipsInputBox>
			<FieldHint $visible={focused}>
				<Kbd>Enter</Kbd>
				<FormattedMessage id="tagProperty.hint.or" defaultMessage="or" />
				<Kbd>,</Kbd>
				<FormattedMessage id="tagProperty.hint.toAdd" defaultMessage="to add · " />
				<Kbd>Backspace</Kbd>
				<FormattedMessage id="tagProperty.hint.removesLast" defaultMessage="removes last" />
			</FieldHint>
			{helperText && <HelperText error={error}>{helperText}</HelperText>}
		</TagPropertyContainer>
	);
};

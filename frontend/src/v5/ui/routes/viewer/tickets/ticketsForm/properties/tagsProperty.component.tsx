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
import { InputLabel, Tooltip } from '@mui/material';
import { DeleteButton } from '@controls/chip/baseChip/baseChip.styles';
import { ChipsInputBox, FieldHint, HelperText, Kbd, TagsChipContainer, TagsChipLabel, TagsInput, TagsPropertyContainer } from './tagsProperty.styles';
import { formatMessage } from '@/v5/services/intl';

type TagsPropertyProps = FormInputProps & {
	value: string[];
	immutable?: boolean;
};

export const TagsProperty = ({ value, onChange, onBlur, disabled, required, label, error, helperText }: TagsPropertyProps) => {
	const tags = Array.isArray(value) ? value : [];
	const [inputValue, setInputValue] = useState('');
	const [focused, setFocused] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);

	const isEditable = !disabled;
	const isFocused = focused && isEditable;
	const containerRef = useRef<HTMLDivElement>(null);

	const commitTag = (raw: string) => {
		const tag = raw.trim().replace(/,+$/, '');
		if (!tag || tags.includes(tag)) return;
		onChange?.({ target: { value: [...tags, tag] } } as any);
	};

	const removeTag = (tag: string) => {
		onChange?.({ target: { value: tags.filter((v) => v !== tag) } } as any);
		// If the field isn't currently focused (e.g. clicking "x" without
		// ever focusing the input), there won't be a later blur to save this
		// change, so save right away. While focused, defer to the container's
		// blur handler so multiple add/delete actions save together once.
		if (!focused) onBlur?.();
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

	// Only save (call the field's onBlur) when focus leaves the whole
	// component, not when it moves internally (e.g. input -> delete button),
	// so multiple tags can be entered before an immutable field locks.
	const handleContainerBlur = (e: React.FocusEvent<HTMLDivElement>) => {
		if (!containerRef.current?.contains(e.relatedTarget as Node)) {
			onBlur?.();
		}
	};

	const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
		e.preventDefault();
		const text = e.clipboardData.getData('text');
		text.split(/[,\n]+/).forEach((part) => commitTag(part));
		setInputValue('');
	};

	// Prevent mousedown on chips/delete buttons from stealing focus away from
	// the input, so clicking "x" doesn't blur the whole component and save
	// the value while a tag is still being edited.
	const preventFocusSteal = (e: React.MouseEvent) => {
		if (e.target !== inputRef.current) e.preventDefault();
	};

	return (
		<TagsPropertyContainer
			ref={containerRef}
			onClick={() => inputRef.current?.focus()}
			onBlur={handleContainerBlur}
			disabled={disabled}
			required={required}
			error={error}
		>
			{label && <InputLabel shrink={false}>{label}</InputLabel>}
			<ChipsInputBox selected={isFocused} error={error} disabled={disabled} required={required} onMouseDown={preventFocusSteal}>
				{tags.map((val) => (
					<Tooltip key={val} title={val}>
						<TagsChipContainer selected={false}>
							<TagsChipLabel>{val}</TagsChipLabel>
							{isEditable && (
								<DeleteButton onClick={(e) => { e.stopPropagation(); removeTag(val); }}>
									<CloseIcon />
								</DeleteButton>
							)}
						</TagsChipContainer>
					</Tooltip>
				))}
				{isEditable && (
					<TagsInput
						ref={inputRef}
						value={inputValue}
						onChange={(e) => {
							const next = e.target.value;
							// Trigger RHF validation (mode: 'onChange') when the raw,
							// uncommitted text is cleared, same as a text field going empty.
							if (inputValue && !next) onChange?.({ target: { value: tags } } as any);
							setInputValue(next);
						}}
						onKeyDown={handleKeyDown}
						onPaste={handlePaste}
						onFocus={() => setFocused(true)}
						onBlur={handleBlur}
						placeholder={formatMessage({ id: 'tagProperty.placeholder.newTag', defaultMessage: 'New tag…' })}
					/>
				)}
			</ChipsInputBox>
			<FieldHint $visible={isFocused}>
				<Kbd>Enter</Kbd>
				<FormattedMessage id="tagProperty.hint.or" defaultMessage="or" />
				<Kbd>,</Kbd>
				<FormattedMessage id="tagProperty.hint.toAdd" defaultMessage="to add · " />
				<Kbd>Backspace</Kbd>
				<FormattedMessage id="tagProperty.hint.removesLast" defaultMessage="removes last" />
			</FieldHint>
			{helperText && <HelperText error={error}>{helperText}</HelperText>}
		</TagsPropertyContainer>
	);
};

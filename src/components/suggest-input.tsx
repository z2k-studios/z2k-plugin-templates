import React, { useState, useRef, useEffect, useCallback } from 'react';

export interface SuggestItem {
	label: string; // display name (e.g. filename)
	value: string; // what gets inserted on selection
	detail?: string; // secondary text (e.g. full path)
}

interface SuggestInputProps {
	value: string;
	onChange: (value: string) => void;
	items: SuggestItem[] | null; // null = loading
	placeholder?: string;
	maxVisible?: number;
}

interface MatchRange {
	start: number;
	end: number;
}

function getMatchRanges(text: string, query: string): MatchRange[] {
	if (!query) { return []; }
	const lower = text.toLowerCase();
	const queryLower = query.toLowerCase();
	const ranges: MatchRange[] = [];
	let pos = 0;
	while (pos < lower.length) {
		const idx = lower.indexOf(queryLower, pos);
		if (idx === -1) { break; }
		ranges.push({ start: idx, end: idx + queryLower.length });
		pos = idx + 1;
	}
	return ranges;
}

function HighlightedText({ text, ranges }: { text: string; ranges: MatchRange[] }) {
	if (ranges.length === 0) { return <>{text}</>; }
	const parts: React.ReactNode[] = [];
	let last = 0;
	for (const range of ranges) {
		if (range.start > last) {
			parts.push(<span key={`t${last}`}>{text.slice(last, range.start)}</span>);
		}
		parts.push(<mark key={`m${range.start}`}>{text.slice(range.start, range.end)}</mark>);
		last = range.end;
	}
	if (last < text.length) {
		parts.push(<span key={`t${last}`}>{text.slice(last)}</span>);
	}
	return <>{parts}</>;
}

function filterItems(items: SuggestItem[], query: string): SuggestItem[] {
	if (!query.trim()) { return items; }
	const q = query.toLowerCase();
	const labelMatches: SuggestItem[] = [];
	const detailMatches: SuggestItem[] = [];
	for (const item of items) {
		if (item.label.toLowerCase().includes(q)) {
			labelMatches.push(item);
		} else if (item.detail && item.detail.toLowerCase().includes(q)) {
			detailMatches.push(item);
		}
	}
	return [...labelMatches, ...detailMatches];
}

export function SuggestInput({ value, onChange, items, placeholder, maxVisible = 100 }: SuggestInputProps) {
	const [showDropdown, setShowDropdown] = useState(false);
	const [highlightIndex, setHighlightIndex] = useState(0);
	const inputRef = useRef<HTMLInputElement>(null);
	const dropdownRef = useRef<HTMLDivElement>(null);

	const filtered = items ? filterItems(items, value) : [];
	const visible = filtered.slice(0, maxVisible);

	// Reset highlight when filtered results change
	useEffect(() => {
		setHighlightIndex(0);
	}, [value]);

	// Scroll highlighted item into view
	useEffect(() => {
		if (!dropdownRef.current) { return; }
		const highlighted = dropdownRef.current.children[highlightIndex] as HTMLElement | undefined;
		if (highlighted) {
			highlighted.scrollIntoView({ block: 'nearest' });
		}
	}, [highlightIndex]);

	const closeDropdown = useCallback(() => setShowDropdown(false), []);

	const selectItem = useCallback((item: SuggestItem) => {
		onChange(item.value);
		setShowDropdown(false);
	}, [onChange]);

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (!showDropdown || visible.length === 0) { return; }
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			setHighlightIndex(prev => (prev + 1) % visible.length);
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			setHighlightIndex(prev => (prev - 1 + visible.length) % visible.length);
		} else if (e.key === 'Enter' || e.key === 'Tab') {
			e.preventDefault();
			selectItem(visible[highlightIndex]);
		} else if (e.key === 'Escape') {
			e.preventDefault();
			setShowDropdown(false);
		}
	};

	return (
		<div className="suggest-input-container">
			<input
				ref={inputRef}
				type="text"
				value={value}
				placeholder={placeholder}
				onChange={e => { onChange(e.target.value); setShowDropdown(true); }}
				onFocus={() => setShowDropdown(true)}
				onBlur={closeDropdown}
				onKeyDown={handleKeyDown}
			/>
			{showDropdown && (
				<div className="suggest-input-dropdown" ref={dropdownRef}>
					{items === null && (
						<div className="suggest-input-loading">Loading...</div>
					)}
					{items !== null && items.length === 0 && (
						<div className="suggest-input-empty">No items available</div>
					)}
					{items !== null && items.length > 0 && visible.length === 0 && value.trim() && (
						<div className="suggest-input-empty">No matches</div>
					)}
					{visible.map((item, i) => {
						const labelRanges = getMatchRanges(item.label, value);
						const detailRanges = item.detail ? getMatchRanges(item.detail, value) : [];
						return (
							<div
								key={item.value}
								className={`suggest-input-item${i === highlightIndex ? ' is-highlighted' : ''}`}
								onMouseEnter={() => setHighlightIndex(i)}
								onMouseDown={e => { e.preventDefault(); selectItem(item); }}
							>
								<span className="suggest-input-label">
									<HighlightedText text={item.label} ranges={labelRanges} />
								</span>
								{item.detail && (
									<span className="suggest-input-detail">
										<HighlightedText text={item.detail} ranges={detailRanges} />
									</span>
								)}
							</div>
						);
					})}
					{filtered.length > maxVisible && (
						<div className="suggest-input-empty">{filtered.length - maxVisible} more...</div>
					)}
				</div>
			)}
		</div>
	);
}

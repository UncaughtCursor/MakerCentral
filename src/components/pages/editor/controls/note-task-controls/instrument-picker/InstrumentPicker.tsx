/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, {
	useContext, useEffect, useRef, useState,
} from 'react';
import DropupArrow from '@mui/icons-material/ArrowDropUp';
import { EntityData, EntityType } from '@data/MakerConstants';
import SelectButton from '@components/pages/controls/SelectButton';
import { previewInstrument } from '@scripts/builder/playback/MusicPlayer';
import EditorContext from '@components/pages/editor/EditorContext';

interface InstrumentPickerState {
	isOpen: boolean,
}

/**
 * The control used to select an instrument.
 */
function InstrumentPicker(props: {
	selectedInstrument: EntityType,
	availableInstrumentTypes: EntityType[],
	onChange: (arg0: EntityType) => void,
}) {
	const [state, setState] = useState({
		isOpen: false,
	} as InstrumentPickerState);
	const ctx = useContext(EditorContext);

	const dropupRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const dropup = dropupRef.current!;

		if (state.isOpen && typeof window !== 'undefined') {
			// Scroll dropup into view
			const verticalOfs = 55 + 20; // Header height plus 20 px
			const dropupPos = dropup.getBoundingClientRect().top;
			const ofsPos = dropupPos + window.pageYOffset - verticalOfs;

			window.scrollTo({
				top: ofsPos,
				behavior: 'smooth',
			});
		}
	});

	return (
		<div>
			<p className="instrument-picker-label">Instrument</p>
			<div
				className="instrument-picker-container"
				role="button"
				tabIndex={0}
				onClick={() => {
					setState({
						...state,
						isOpen: !state.isOpen,
					});
				}}
			>
				<p
					className="instrument-picker-container-entity-text"
				>{props.selectedInstrument}
				</p>
				<p
					className="instrument-picker-container-instrument-text"
				>{EntityData[props.selectedInstrument].instrumentName.toUpperCase()}
				</p>
				<div className="instrument-picker-container-arrow-container">
					<DropupArrow
						style={state.isOpen
							? { transform: 'rotate(180deg)', color: 'var(--text-color)' }
							: { color: 'var(--text-color)' }}
					/>
				</div>
			</div>
			<div
				className="instrument-picker-dropup"
				style={{ visibility: state.isOpen ? 'visible' : 'hidden' }}
				ref={dropupRef}
			>
				{getButtons()}
			</div>
		</div>
	);

	/**
	 * Returns the button components used to make up the instrument menu.
	 * @returns The created components.
	 */
	function getButtons() {
		return props.availableInstrumentTypes.map((insType) => {
			const ins = EntityData[insType];

			return (
				<SelectButton
					/* Reanimate on menu open */
					key={`${state.isOpen ? 'open' : 'shut'}${insType}`}
					text={ins.name}
					type={ins.name === props.selectedInstrument ? 'selected' : ''}
					onClick={() => {
						previewInstrument(ins.name, ctx.noteSchedule!);
						props.onChange(ins.name as EntityType);
					}}
					animDelayPerPx={0.2}
				/>
			);
		});
	}
}

export default InstrumentPicker;

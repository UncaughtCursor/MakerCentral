import React, { ForwardedRef, ReactNode } from 'react';
import './Piano.css';

interface PianoProps {
	noteHeightPx: number,
	topOctaveNumber: number,
	minNote: number,
	semitoneOffset: number,
	heightPx: number,
}

const whiteKeysPerOctave = 7;
const whiteNoteLetters = ['C', 'D', 'E', 'F', 'G', 'A', 'B'] as const;
const hasBlackKeyBelow = {
	C: false,
	D: true,
	E: true,
	F: false,
	G: true,
	A: true,
	B: true,
} as const;

type WhiteNoteLetter = typeof whiteNoteLetters[number];

const borderWidthPx = 1;

/**
 * Displays a piano keyboard in line with the displayed music.
 */
const Piano = React.forwardRef((props: PianoProps, ref: ForwardedRef<HTMLDivElement>) => {
	const keys = getKeys();
	return (
		<div
			className="piano-container"
			style={{
				width: `${(props.noteHeightPx * 4) + (2 * borderWidthPx)}px`,
				height: `${props.heightPx}px`,
			}}
			ref={ref}
		>
			{keys}
		</div>
	);

	/**
	 * Generates the keys to be displayed on the piano.
	 */
	function getKeys() {
		const pianoKeys: ReactNode[] = [];
		const pxLimit = props.heightPx - props.semitoneOffset * props.noteHeightPx;

		let i = 0;
		let px = 0;
		let continueDrawing = true;
		while (continueDrawing) {
			// if (y > props.height + (props.semitoneOffset * props.noteHeightPx)) break;

			const keyName = whiteKeyIndexToNoteString(i);
			const keyLetter = keyName.charAt(0) as WhiteNoteLetter;
			const keyHeight = getWhiteKeyHeightByLetter(keyLetter);

			const translateOfs = props.semitoneOffset * props.noteHeightPx + 2;

			pianoKeys.push(
				<div
					className="piano-key-white"
					style={{
						width: props.noteHeightPx * 4,
						height: keyHeight - (2 * borderWidthPx),
						transform: `translateY(${translateOfs}px)`,
					}}
					key={keyName}
				>
					<p
						style={{
							fontSize: `${props.noteHeightPx * 1.1}px`,
							marginRight: `${props.noteHeightPx * 0.2}px`,
						}}
					>{keyName}
					</p>
				</div>,
			);
			if (hasBlackKeyBelow[keyLetter]) {
				pianoKeys.push(
					<div
						className="piano-key-black"
						style={{
							width: props.noteHeightPx * 2.25,
							height: props.noteHeightPx,
							borderTopRightRadius: 0.2 * props.noteHeightPx,
							borderBottomRightRadius: 0.2 * props.noteHeightPx,
							transform: `translateY(calc(${translateOfs}px - 50%))`,
						}}
						key={`${keyName}b`}
					/>,
				);
			}

			i++;
			px += keyHeight;
			if (px >= pxLimit) continueDrawing = false;
		}
		return pianoKeys;
	}

	/**
	 * Converts the index of a displayed white key to its corresponding note name.
	 * @param n The index.
	 * @returns The note name.
	 */
	function whiteKeyIndexToNoteString(n: number) {
		const noteLetterIdx = whiteKeysPerOctave - (n % whiteKeysPerOctave) - 1;
		const octaveNumber = props.topOctaveNumber - Math.floor(n / whiteKeysPerOctave);
		return `${whiteNoteLetters[noteLetterIdx]}${octaveNumber}`;
	}

	/**
	 * Given the letter of the note, returns the height of its corresponding white key.
	 * @param letter The letter of the note.
	 * @returns The height in pixels.
	 */
	function getWhiteKeyHeightByLetter(letter: WhiteNoteLetter) {
		if (letter === 'D' || letter === 'G' || letter === 'A') {
			return props.noteHeightPx * 2;
		}
		return props.noteHeightPx * 1.5;
	}
});

export default Piano;

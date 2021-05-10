export type Note = 'A' | 'A#' | 'B' | 'C' | 'C#' | 'D' | 'D#' | 'E' | 'F' | 'F#' | 'G' | 'G#';

export type NotesChord = MutedOpenNoteNotation | number | 'x' | null;

export interface Dot {
  fret: number;
  count: number;
}

export interface NoteActive {
  fret: number;
  string: number;
}

export enum MutedOpenNote {
  none = 'none',
  open = 'open',
  muted = 'muted',
}

export enum MutedOpenNoteNotation {
  none = '',
  open = 0,
  muted = 'x',
}

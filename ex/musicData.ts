export type RiffGraceNote = {
	vibrato: boolean
};
export type RiffDuration = {
	count: number
	, fraction: number
};
export type RiffPitch = {
	key: number
	, octave: number
	, shift: number
};
export type RiffPoint = {
	pitch: RiffPitch
	, duration: RiffDuration
	, graceNote: RiffGraceNote
};
export type RiffChord = {
	start: RiffDuration
	, points: RiffPoint[]
	, icon: string
	, comment: string
	, graceNote: RiffGraceNote
};
export type RiffMeasure = {
	chords: RiffChord[]
	, fifths: number
	, tempo: number
	, meter: RiffDuration
	, transpose: number
	, clef: number
};
export type RiffVoice = {
	title: string
	, measures: RiffMeasure[]
};
export type RiffSong = {
	title: string
	, voices: RiffVoice[]
};

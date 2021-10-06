// angular
import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';

// rxjs
import { Subscription } from 'rxjs';

// services
import { MainService } from '../../services/notes.service';

// models
import { Dot, MutedOpenNote, MutedOpenNoteNotation, Note, NoteActive, NotesChord } from '../../models/models';

// third party
// @ts-ignore
import { ChordBox } from 'vexchords';

@Component({
  selector: 'app-fretboard',
  templateUrl: './fretboard.component.html',
  styleUrls: ['./fretboard.component.scss'],
})
export class FretboardComponent implements OnInit, OnDestroy {
  // --------------------------------------------------
  // #VARS
  // --------------------------------------------------

  notes: Note[];
  numStrings: number;
  strings: any[];
  numFrets: number;
  svgNumFrets: number;
  dots: Dot[];
  frets: any[];
  tuning!: Note[];

  chord: any;
  notesClicked: NoteActive[] = [];
  mutedOpenNotes: MutedOpenNote[];

  private subscription = new Subscription();





  // --------------------------------------------------
  // #CONSTRUCTOR
  // --------------------------------------------------

  constructor(
    private mainService: MainService
  ) {
    this.notes = this.mainService.notes;
    this.numStrings = this.mainService.numStrings;
    this.numFrets = this.mainService.numFrets;
    this.svgNumFrets = this.mainService.chordImageConfig.numFrets;
    this.dots = this.mainService.dots;
    this.frets = Array.from(Array(this.numFrets).keys());
    this.strings = Array.from(Array(this.numStrings).keys());

    this.mutedOpenNotes = Array.from(Array(this.numStrings)).map(_ => MutedOpenNote.none);

    this.subscription.add(
      this.mainService.tuningObs
        .subscribe((notes: Note[]) => {
          this.tuning = notes;
        })
    );
  }





  // --------------------------------------------------
  // #REFERENCES
  // --------------------------------------------------

  // output --------------------

  @Output() readonly hasNotes = new EventEmitter<boolean>();





  // --------------------------------------------------
  // #LIFECYCLES
  // --------------------------------------------------

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }





  // --------------------------------------------------
  // #FUNCTIONS
  // --------------------------------------------------

  dotCount(index: number): number[] {
    const dots = this.dots.map((d: Dot) => d.fret);
    if (dots.includes(index)) {
      const position = dots.indexOf(index);
      return Array.from(Array(this.dots[position]?.count).keys());
    } else {
      return [0];
    }
  }

  dotHidden(index: number): boolean {
    return !this.dots.map((d: Dot) => d.fret).includes(index);
  }

  clickNote(stringIndex: number, fretIndex: number): void {
    const note: NoteActive = { fret: fretIndex, string: stringIndex };
    const notesCheck = this.notesClicked.map(n => JSON.stringify(n));

    if (notesCheck.includes(JSON.stringify(note))) {
      const noteIndexOf = notesCheck.indexOf(JSON.stringify(note));
      this.notesClicked.splice(noteIndexOf, 1);
    } else {
      this.notesClicked.push(note);
    }

    this.createContentChild();
  }

  createContentChild(): void {
    if (this.notesClicked.length > 0 || !this.mutedOpenNotes.every(n => n === MutedOpenNote.none)) {
      this.hasNotes.emit(true);
    } else {
      this.hasNotes.emit(false);
    }

    let positionMin: number = Math.min.apply(null, this.notesClicked.map(n => n.fret));
    let positionMax: number = Math.max.apply(null, this.notesClicked.map(n => n.fret));
    positionMin = isFinite(positionMin) ? positionMin : 0;
    positionMax = isFinite(positionMax) ? positionMax : 0;

    let position: number = 0;
    if (positionMin > this.svgNumFrets) {
      // position = positionMax - (this.svgNumFrets - 1);
      position = positionMin;
    }

    // if (positionMax - positionMin > (this.svgNumFrets - 1)) {
    //   position = positionMax - this.svgNumFrets;
    // }
    // else if ((positionMax + 1) - this.svgNumFrets > 0) {
    //   position = (positionMax + 1) - (this.svgNumFrets);
    // }

    const tuning: Note[] = this.tuning;
    let notes: number[][] = this.notesClicked.map(n => [n.string, n.fret]);
    const mutedOpenNotes: NotesChord[][] = this.mutedOpenNotes
      .map(n => {
        if (n === MutedOpenNote.none) { return MutedOpenNoteNotation.none; }
        if (n === MutedOpenNote.open) { return MutedOpenNoteNotation.open; }
        if (n === MutedOpenNote.muted) { return MutedOpenNoteNotation.muted; }
        return null;
      })
      .map((n, index) => [index + 1, n])
      .filter(n => n[1] !== MutedOpenNoteNotation.none);

    if (position && position > 1) {
      notes = notes.map(n => [n[0], n[1] - position + 1]);
    }

    const chord: NotesChord[][] = [
      ...notes,
      ...mutedOpenNotes
    ];

    this.drawChord(chord, position, tuning);
  }

  checkActiveNote(stringIndex: number, fretIndex: number): boolean {
    const note: NoteActive = { fret: fretIndex, string: stringIndex };
    const notesCheck = this.notesClicked.map(n => JSON.stringify(n));

    return notesCheck.includes(JSON.stringify(note));
  }

  cycleMutedOpenNote(index: number): void {
    let state: MutedOpenNote = MutedOpenNote.none;
    if (this.mutedOpenNotes[index] === 'none') { state = MutedOpenNote.open; }
    if (this.mutedOpenNotes[index] === 'open') { state = MutedOpenNote.muted; }
    if (this.mutedOpenNotes[index] === 'muted') { state = MutedOpenNote.none; }
    this.mutedOpenNotes[index] = state;

    this.createContentChild();
  }

  getMutedOpenNote(index: number): MutedOpenNote | undefined {
    if (this.mutedOpenNotes[index] === 'none') { return MutedOpenNote.none; }
    if (this.mutedOpenNotes[index] === 'open') { return MutedOpenNote.open; }
    if (this.mutedOpenNotes[index] === 'muted') { return MutedOpenNote.muted; }
    return undefined;
  }

  onTuningChange(event: any, index: number): void {
    const note = event.target.value.toUpperCase();
    const newTuning = [...this.tuning];
    newTuning[index] = note;
    this.mainService.updateTuning(newTuning);

    this.createContentChild();
  }

  drawChord(chord: NotesChord[][], position: number | null, tuning: Note[]): void {
    const chordElem = document.querySelector('#chord') as HTMLDivElement;

    if (chordElem) {
      chordElem.innerHTML = '';
    }

    this.chord = new ChordBox('#chord', this.mainService.chordImageConfig);
    this.chord.draw({ chord, position, tuning });
    this.svgToImg();

    // this.chord.draw({
    //   chord: [
    //     [1, 2],
    //     [2, 1],
    //     [3, 2],
    //     [4, 0], // fret 0 = open string
    //     [5, 'x'], // fret x = muted string
    //     [6, 'x'],
    //   ],

    //   position: 5, // start render at fret 5

    //   // barres: [
    //   //   { fromString: 6, toString: 1, fret: 1 },
    //   //   { fromString: 5, toString: 3, fret: 3 },
    //   // ],

    //   tuning: ['E', 'A', 'D', 'G', 'B', 'E'],
    // });
  }

  svgToImg(): void {
    const svgElem = document.querySelector('svg');
    const chordImg = document.querySelector('#chord-img');
    const canvas = document.querySelector('#canvas') as HTMLCanvasElement;

    if (svgElem && chordImg) {
      const svgString = new XMLSerializer().serializeToString(svgElem);
      const svgSize = svgElem.getBoundingClientRect();
      canvas.width = svgSize.width;
      canvas.height = svgSize.height;
      const context = canvas.getContext('2d');
      context?.clearRect(0, 0, canvas.width, canvas.height);
      const DOMURL = (self.URL || self.webkitURL || self) as any;
      const img = new Image();
      // img.src = '';
      const svg = new Blob([svgString], { type: 'image/svg+xml' });
      const url = DOMURL.createObjectURL(svg);
      // chordImg.innerHTML = '';
      img.onload = () => {
        console.log('img:', img);
        context?.drawImage(img, 0, 0);
        const png = canvas.toDataURL('image/png');
        chordImg.innerHTML = `
          <img src="${png}"/>
          <a href="${png}" class="btn-download" download="gchord">Download</a>
        `;
        DOMURL.revokeObjectURL(png);
        // canvas.remove();
      };
      // img.onerror = (err) => {
      //   console.log('err:', err);
      // };
      img.src = url;
    }
  }
}

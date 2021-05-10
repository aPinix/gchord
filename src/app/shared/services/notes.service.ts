// angular
import { Injectable } from '@angular/core';

// rxjs
import { BehaviorSubject, Observable } from 'rxjs';

// models
import { Dot, Note } from '../models/typings';

@Injectable({
  providedIn: 'root',
})
export class MainService {
  chordImgWidth: number = 100;
  chordImgHeight: number = 120;

  chordImageConfig = {
    width: this.chordImgWidth,
    height: this.chordImgHeight,

    numStrings: 6,
    numFrets: 5,
    showTuning: true,

    defaultColor: '#545D6A',
    bgColor: '#FFF',
    strokeColor: '#545D6A',
    textColor: '#545D6A',
    stringColor: '#545D6A',
    fretColor: '#545D6A',
    labelColor: '#545D6A',

    fretWidth: 1,
    stringWidth: 1,
  };
  notes: Note[] = [
    'A',
    'A#',
    'B',
    'C',
    'C#',
    'D',
    'D#',
    'E',
    'F',
    'F#',
    'G',
    'G#',
  ];
  numStrings: number = 6;
  numFrets: number = 15;
  tuningDefault: Note[] = ['E', 'A', 'D', 'G', 'B', 'E'];
  dots: Dot[] = [
    { fret: 3, count: 1 },
    { fret: 5, count: 1 },
    { fret: 7, count: 2 },
    { fret: 9, count: 1 },
    { fret: 12, count: 2 },
    { fret: 15, count: 1 },
    { fret: 17, count: 2 },
  ];

  private tuningObs$: BehaviorSubject<Note[]> = new BehaviorSubject<Note[]>(this.tuningDefault);

  constructor() {}

  get tuningObs(): Observable<Note[]> {
    return this.tuningObs$.asObservable();
  }

  updateTuning(notes: Note[]): void {
    this.tuningObs$.next(notes);
  }
}

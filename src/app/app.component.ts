// angular
import { Component } from '@angular/core';

// services
import { MainService } from './shared/services/notes.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  notes;
  nasNotes: boolean = false;

  chordImgWidth: number;
  chordImgHeight: number;

  constructor(private mainService: MainService) {
    this.notes = this.mainService.notes;
    this.chordImgWidth = this.mainService.chordImgWidth;
    this.chordImgHeight = this.mainService.chordImgHeight;
  }

  onHasNotes(event: boolean): void {
    this.nasNotes = event;
  }
}

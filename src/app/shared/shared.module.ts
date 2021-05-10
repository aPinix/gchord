// angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// components
import { FretboardComponent } from './components/fretboard/fretboard.component';

const COMPONENTS = [FretboardComponent];

@NgModule({
  declarations: [...COMPONENTS],
  imports: [CommonModule],
  exports: [...COMPONENTS],
})
export class SharedModule {}

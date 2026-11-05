import { Component, signal } from '@angular/core';
import { FlashcardCreatorComponent } from './flashcard-creator.component';
import { FlashcardDemoComponent } from './flashcard-demo.component';
import { SubjectListComponent } from './subject-list.component';

@Component({
  imports: [FlashcardDemoComponent, FlashcardCreatorComponent, SubjectListComponent],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  readonly selectedSubjectId = signal<string | null>(null);

  openSubject(subjectId: string): void {
    this.selectedSubjectId.set(subjectId);
  }

  backToSubjects(): void {
    this.selectedSubjectId.set(null);
  }
}

import { Component, inject, output } from '@angular/core';
import { FlashcardService } from './flashcard.service';

@Component({
  selector: 'app-subject-list',
  standalone: true,
  template: `
    <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      @for (subject of flashcards.subjects(); track subject.id) {
        <button
          type="button"
          (click)="subjectSelected.emit(subject.id)"
          class="group flex flex-col items-start gap-6 rounded-3xl border border-[#6B7A3A]/30 bg-[#F9E4E9] p-8 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#6B7A3A] hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6B7A3A]"
        >
          <span class="h-1 w-10 rounded-full bg-[#6B7A3A] transition-all duration-300 group-hover:w-16"></span>
          <span class="text-xl font-semibold leading-[1.2] text-[#3E3B33]">{{ subject.name }}</span>
          <span class="mt-auto text-sm text-[#5F5B52]">{{ countLabel(subject.id) }}</span>
        </button>
      }
    </div>
  `,
})
export class SubjectListComponent {
  protected readonly flashcards = inject(FlashcardService);
  readonly subjectSelected = output<string>();

  countLabel(subjectId: string): string {
    const count = this.flashcards.countFor(subjectId);
    return count === 1 ? '1 tarjeta' : `${count} tarjetas`;
  }
}

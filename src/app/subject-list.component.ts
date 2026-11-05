import { Component, inject, output, signal } from '@angular/core';
import { FlashcardService, Subject } from './flashcard.service';

@Component({
  selector: 'app-subject-list',
  standalone: true,
  template: `
    <div class="mb-8 flex justify-end">
      <button
        type="button"
        (click)="openForm()"
        class="rounded-full bg-[#222222] px-5 py-2.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-[#5A6831] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6B7A3A]"
      >
        + Materia
      </button>
    </div>

    @if (showForm()) {
      <form
        class="mb-10 flex flex-col gap-4 rounded-3xl bg-[#FBF8F4] p-6 shadow-[0_12px_32px_-16px_rgba(62,59,51,0.3)] ring-1 ring-black/5 sm:flex-row sm:items-start"
        (submit)="$event.preventDefault(); saveSubject()"
      >
        <div class="flex min-w-0 flex-1 flex-col gap-2">
          <label for="new-subject-name" class="text-xs font-medium uppercase tracking-widest text-[#6B7A3A]">Nombre de la materia</label>
          <input
            id="new-subject-name"
            type="text"
            [value]="newName()"
            (input)="onNameInput($event)"
            placeholder="Ej. Anatomía, Cálculo..."
            [attr.aria-invalid]="formError() !== null"
            [attr.aria-describedby]="formError() ? 'new-subject-error' : null"
            class="w-full rounded-2xl bg-white px-4 py-3 text-base text-[#3E3B33] placeholder:text-[#8F8A7E] ring-1 ring-black/10 transition-shadow duration-200 focus:outline-none focus:ring-2 focus:ring-[#6B7A3A]"
          />
          @if (formError()) {
            <p id="new-subject-error" role="alert" class="text-sm leading-[1.5] text-[#A3475C]">{{ formError() }}</p>
          }
        </div>

        <div class="flex gap-3 sm:pt-7">
          <button
            type="button"
            (click)="closeForm()"
            class="rounded-full px-5 py-2.5 text-sm font-medium text-[#3E3B33] ring-1 ring-black/10 transition-colors duration-200 hover:bg-white"
          >
            Cancelar
          </button>
          <button
            type="submit"
            class="rounded-full bg-[#6B7A3A] px-5 py-2.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-[#5A6831] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6B7A3A]"
          >
            Guardar Mazo
          </button>
        </div>
      </form>
    }

    @if (flashcards.subjects().length === 0) {
      <div class="flex h-64 flex-col items-center justify-center gap-3 rounded-3xl bg-[#F9E4E9] p-8 text-center ring-1 ring-black/5">
        <h3 class="text-xl font-semibold leading-[1.2] text-[#3E3B33]">Aún no tienes materias</h3>
        <p class="text-base leading-[1.5] text-[#5F5B52]">Crea la primera con el botón «+ Materia».</p>
      </div>
    } @else {
      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        @for (subject of flashcards.subjects(); track subject.id) {
          <div class="relative">
            <button
              type="button"
              (click)="subjectSelected.emit(subject.id)"
              class="group flex h-full w-full flex-col items-start gap-6 rounded-3xl border border-[#6B7A3A]/30 bg-[#F9E4E9] p-8 pr-16 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#6B7A3A] hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6B7A3A]"
            >
              <span class="h-1 w-10 rounded-full bg-[#6B7A3A] transition-all duration-300 group-hover:w-16"></span>
              <span class="text-xl font-semibold leading-[1.2] text-[#3E3B33]">{{ subject.name }}</span>
              <span class="mt-auto text-sm text-[#5F5B52]">{{ countLabel(subject.id) }}</span>
            </button>

            <button
              type="button"
              (click)="requestDelete(subject)"
              [attr.aria-label]="'Eliminar la materia ' + subject.name"
              class="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-[#5F5B52] transition-colors duration-200 hover:bg-white hover:text-[#A3475C] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A3475C]"
            >
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M3 6h18" />
                <path d="M8 6V4h8v2" />
                <path d="M19 6l-1 14H6L5 6" />
              </svg>
            </button>
          </div>
        }
      </div>
    }

    @if (pendingDelete(); as subject) {
      <div
        class="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/30 px-6 backdrop-blur-sm"
        (click)="cancelDelete()"
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-subject-title"
          (click)="$event.stopPropagation()"
          class="w-full max-w-sm rounded-3xl bg-[#FBF8F4] p-8 font-sans text-[#3E3B33] shadow-[0_12px_32px_-16px_rgba(62,59,51,0.3)] ring-1 ring-black/5"
        >
          <h3 id="delete-subject-title" class="text-xl font-semibold leading-[1.2]">¿Eliminar «{{ subject.name }}»?</h3>
          <p class="mt-3 text-base leading-[1.5] text-[#5F5B52]">
            Se borrarán esta materia y todas sus tarjetas ({{ countLabel(subject.id) }}). Esta acción no se puede deshacer.
          </p>
          <div class="mt-8 flex justify-end gap-3">
            <button
              type="button"
              (click)="cancelDelete()"
              class="rounded-full px-5 py-2.5 text-sm font-medium text-[#3E3B33] ring-1 ring-black/10 transition-colors duration-200 hover:bg-white"
            >
              Cancelar
            </button>
            <button
              type="button"
              (click)="confirmDelete(subject)"
              class="rounded-full bg-[#A3475C] px-5 py-2.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-[#8C3A4D] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A3475C]"
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class SubjectListComponent {
  protected readonly flashcards = inject(FlashcardService);
  readonly subjectSelected = output<string>();

  readonly showForm = signal(false);
  readonly newName = signal('');
  readonly formError = signal<string | null>(null);
  readonly pendingDelete = signal<Subject | null>(null);

  countLabel(subjectId: string): string {
    const count = this.flashcards.countFor(subjectId);
    return count === 1 ? '1 tarjeta' : `${count} tarjetas`;
  }

  openForm(): void {
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.newName.set('');
    this.formError.set(null);
  }

  onNameInput(event: Event): void {
    this.newName.set((event.target as HTMLInputElement).value);
    this.formError.set(null);
  }

  saveSubject(): void {
    const name = this.newName().trim();
    if (!name) {
      this.formError.set('Escribe un nombre para la materia.');
      return;
    }
    if (this.flashcards.hasSubjectNamed(name)) {
      this.formError.set('Ya existe una materia con ese nombre.');
      return;
    }
    this.flashcards.addSubject(name);
    this.closeForm();
  }

  requestDelete(subject: Subject): void {
    this.pendingDelete.set(subject);
  }

  cancelDelete(): void {
    this.pendingDelete.set(null);
  }

  confirmDelete(subject: Subject): void {
    this.flashcards.deleteSubject(subject.id);
    this.pendingDelete.set(null);
  }
}

import { Component, inject, input, linkedSignal, signal } from '@angular/core';
import { FlashcardService } from './flashcard.service';

@Component({
  selector: 'app-flashcard-creator',
  standalone: true,
  template: `
    <section class="mx-auto flex w-full max-w-md flex-col gap-6 rounded-3xl bg-[#FBF8F4] p-8 font-sans text-[#3E3B33] shadow-[0_12px_32px_-16px_rgba(62,59,51,0.3)] ring-1 ring-black/5">
      <h3 class="text-xl font-semibold leading-[1.2]">Crea tu propia tarjeta</h3>

      <div class="flex flex-col gap-2">
        <label for="flashcard-subject" class="text-xs font-medium uppercase tracking-widest text-[#6B7A3A]">Materia</label>
        <select
          id="flashcard-subject"
          (change)="selectedSubjectId.set(fieldValue($event))"
          class="w-full rounded-2xl bg-white px-4 py-3 text-base text-[#3E3B33] ring-1 ring-black/10 transition-shadow duration-200 focus:outline-none focus:ring-2 focus:ring-[#6B7A3A]"
        >
          @for (subject of flashcards.subjects(); track subject.id) {
            <option [value]="subject.id" [selected]="subject.id === selectedSubjectId()">{{ subject.name }}</option>
          }
        </select>

        @if (showNewSubject()) {
          <div class="mt-2 flex gap-2">
            <input
              type="text"
              aria-label="Nombre de la nueva materia"
              [value]="newSubjectName()"
              (input)="newSubjectName.set(fieldValue($event))"
              (keydown.enter)="addSubject()"
              placeholder="Ej.: Geología"
              class="min-w-0 flex-1 rounded-2xl bg-white px-4 py-2.5 text-sm text-[#3E3B33] placeholder:text-[#8F8A7E] ring-1 ring-black/10 focus:outline-none focus:ring-2 focus:ring-[#6B7A3A]"
            />
            <button
              type="button"
              (click)="addSubject()"
              class="rounded-full bg-white px-4 py-2 text-sm font-medium text-[#3E3B33] ring-1 ring-black/10 transition-colors duration-200 hover:bg-[#F3EFE8]"
            >
              Añadir
            </button>
          </div>
        } @else {
          <button
            type="button"
            (click)="showNewSubject.set(true)"
            class="self-start text-sm font-medium text-[#6B7A3A] transition-colors duration-200 hover:text-[#5A6831]"
          >
            + Crear nueva materia
          </button>
        }
      </div>

      <div class="flex flex-col gap-2">
        <label for="flashcard-front" class="text-xs font-medium uppercase tracking-widest text-[#6B7A3A]">Frente (Pregunta)</label>
        <textarea
          id="flashcard-front"
          rows="3"
          [value]="front()"
          (input)="front.set(fieldValue($event))"
          placeholder="Ej.: ¿Qué es la mitocondria?"
          class="w-full resize-none rounded-2xl bg-white px-4 py-3 text-base leading-[1.5] text-[#3E3B33] placeholder:text-[#8F8A7E] ring-1 ring-black/10 transition-shadow duration-200 focus:outline-none focus:ring-2 focus:ring-[#6B7A3A]"
        ></textarea>
      </div>

      <div class="flex flex-col gap-2">
        <label for="flashcard-back" class="text-xs font-medium uppercase tracking-widest text-[#6B7A3A]">Reverso (Respuesta)</label>
        <textarea
          id="flashcard-back"
          rows="3"
          [value]="back()"
          (input)="back.set(fieldValue($event))"
          placeholder="Ej.: Orgánulo que produce la mayor parte de la energía de la célula."
          class="w-full resize-none rounded-2xl bg-white px-4 py-3 text-base leading-[1.5] text-[#3E3B33] placeholder:text-[#8F8A7E] ring-1 ring-black/10 transition-shadow duration-200 focus:outline-none focus:ring-2 focus:ring-[#6B7A3A]"
        ></textarea>
      </div>

      @if (errorMessage()) {
        <p role="alert" class="text-sm leading-[1.5] text-[#A3475C]">{{ errorMessage() }}</p>
      }

      @if (savedMessage()) {
        <p role="status" class="text-sm leading-[1.5] text-[#5A6831]">Tarjeta guardada. Ya aparece en el mazo de su materia.</p>
      }

      <button
        type="button"
        (click)="save()"
        class="rounded-full bg-[#6B7A3A] px-5 py-2.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-[#5A6831] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6B7A3A]"
      >
        Guardar Tarjeta
      </button>
    </section>
  `,
})
export class FlashcardCreatorComponent {
  protected readonly flashcards = inject(FlashcardService);

  readonly defaultSubjectId = input.required<string>();
  readonly selectedSubjectId = linkedSignal(() => this.defaultSubjectId());

  readonly front = signal('');
  readonly back = signal('');
  readonly showNewSubject = signal(false);
  readonly newSubjectName = signal('');
  readonly errorMessage = signal<string | null>(null);
  readonly savedMessage = signal(false);

  fieldValue(event: Event): string {
    return (event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement).value;
  }

  addSubject(): void {
    const name = this.newSubjectName().trim();
    if (!name) {
      this.savedMessage.set(false);
      this.errorMessage.set('Escribe un nombre para la nueva materia.');
      return;
    }

    const subject = this.flashcards.addSubject(name);
    this.selectedSubjectId.set(subject.id);
    this.newSubjectName.set('');
    this.showNewSubject.set(false);
    this.errorMessage.set(null);
  }

  save(): void {
    const front = this.front().trim();
    const back = this.back().trim();

    if (!front || !back) {
      this.savedMessage.set(false);
      this.errorMessage.set('Escribe el frente y el reverso de la tarjeta antes de guardarla.');
      return;
    }

    this.flashcards.addCard(this.selectedSubjectId(), front, back);
    this.front.set('');
    this.back.set('');
    this.errorMessage.set(null);
    this.savedMessage.set(true);
  }
}

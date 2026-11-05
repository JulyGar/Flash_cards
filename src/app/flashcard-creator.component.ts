import type { MathfieldElement } from 'mathlive';
import { CUSTOM_ELEMENTS_SCHEMA, Component, ElementRef, afterNextRender, inject, input, linkedSignal, signal, viewChild } from '@angular/core';
import { FlashcardService } from './flashcard.service';

@Component({
  selector: 'app-flashcard-creator',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
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
        <span class="text-xs font-medium uppercase tracking-widest text-[#6B7A3A]">Frente (Pregunta)</span>
        <div class="rounded-2xl bg-white px-4 py-3 ring-1 ring-black/10 transition-shadow duration-200 focus-within:ring-2 focus-within:ring-[#6B7A3A]">
          <math-field #frontField aria-label="Frente de la tarjeta" class="block w-full text-lg outline-none"></math-field>
        </div>
      </div>

      <div class="flex flex-col gap-2">
        <span class="text-xs font-medium uppercase tracking-widest text-[#6B7A3A]">Reverso (Respuesta)</span>
        <div class="rounded-2xl bg-white px-4 py-3 ring-1 ring-black/10 transition-shadow duration-200 focus-within:ring-2 focus-within:ring-[#6B7A3A]">
          <math-field #backField aria-label="Reverso de la tarjeta" class="block w-full text-lg outline-none"></math-field>
        </div>
        <p class="text-xs leading-[1.5] text-[#6F6B61]">Escribe texto o fórmulas. Las fórmulas se muestran con formato matemático.</p>
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

  readonly frontField = viewChild.required<ElementRef<MathfieldElement>>('frontField');
  readonly backField = viewChild.required<ElementRef<MathfieldElement>>('backField');

  readonly defaultSubjectId = input.required<string>();
  readonly selectedSubjectId = linkedSignal(() => this.defaultSubjectId());

  readonly showNewSubject = signal(false);
  readonly newSubjectName = signal('');
  readonly errorMessage = signal<string | null>(null);
  readonly savedMessage = signal(false);

  constructor() {
    afterNextRender(() => {
      void import('mathlive');
    });
  }

  fieldValue(event: Event): string {
    return (event.target as HTMLInputElement | HTMLSelectElement).value;
  }

  addSubject(): void {
    const name = this.newSubjectName().trim();
    if (!name) {
      this.savedMessage.set(false);
      this.errorMessage.set('Escribe un nombre para la nueva materia.');
      return;
    }
    if (this.flashcards.hasSubjectNamed(name)) {
      this.errorMessage.set('Ya existe una materia con ese nombre.');
      return;
    }

    const subject = this.flashcards.addSubject(name);
    this.selectedSubjectId.set(subject.id);
    this.newSubjectName.set('');
    this.showNewSubject.set(false);
    this.errorMessage.set(null);
  }

  save(): void {
    const front = this.frontField().nativeElement.value.trim();
    const back = this.backField().nativeElement.value.trim();
    console.log('Guardando tarjeta', { front, back });

    if (!front || !back) {
      this.savedMessage.set(false);
      this.errorMessage.set('Escribe el frente y el reverso de la tarjeta antes de guardarla.');
      return;
    }

    this.flashcards.addCard(this.selectedSubjectId(), toFormula(front), toFormula(back));
    this.frontField().nativeElement.value = '';
    this.backField().nativeElement.value = '';
    this.errorMessage.set(null);
    this.savedMessage.set(true);
  }
}

function toFormula(latex: string): string {
  return `$${latex}$`;
}

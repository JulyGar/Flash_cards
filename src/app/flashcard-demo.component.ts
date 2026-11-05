import { Component, OnDestroy, computed, inject, input, signal } from '@angular/core';
import { FlashcardService } from './flashcard.service';

const FLIP_DURATION_MS = 600;

@Component({
  selector: 'app-flashcard-demo',
  standalone: true,
  template: `
    <section class="mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-8 font-sans text-[#3E3B33]">
      <header class="flex items-center justify-between text-sm">
        <span class="font-medium text-[#6B7A3A]">{{ subjectName() }}</span>
        <span class="text-[#6F6B61]" aria-live="polite">{{ progressLabel() }}</span>
      </header>

      @if (cards().length === 0) {
        <div class="flex h-72 w-full flex-col items-center justify-center gap-3 rounded-3xl bg-[#F9E4E9] p-8 text-center shadow-[0_12px_32px_-16px_rgba(62,59,51,0.3)] ring-1 ring-black/5">
          <h2 class="text-xl font-semibold leading-[1.2]">Aún no hay tarjetas</h2>
          <p class="text-base leading-[1.5] text-[#5F5B52]">Crea la primera tarjeta de esta materia más abajo.</p>
        </div>
      } @else if (isFinished()) {
        <div class="flex h-72 w-full flex-col items-center justify-center gap-4 rounded-3xl bg-[#FBF8F4] p-8 text-center shadow-[0_12px_32px_-16px_rgba(62,59,51,0.3)] ring-1 ring-black/5">
          <h2 class="text-2xl font-semibold leading-[1.2]">Mazo terminado</h2>
          <p class="text-base leading-[1.5] text-[#5F5B52]">
            Lo sabías: {{ knownCount() }} · Para repasar: {{ reviewCount() }}
          </p>
          <button
            type="button"
            (click)="restart()"
            class="mt-2 rounded-full bg-[#6B7A3A] px-5 py-2.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-[#5A6831] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6B7A3A]"
          >
            Repetir mazo
          </button>
        </div>
      } @else {
        <div class="flashcard-scene">
          <div
            class="flashcard relative h-72 w-full cursor-pointer rounded-3xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#6B7A3A]"
            [class.is-flipped]="isFlipped()"
            role="button"
            tabindex="0"
            [attr.aria-pressed]="isFlipped()"
            [attr.aria-label]="isFlipped() ? 'Respuesta. Pulsa para ver la pregunta' : 'Pregunta. Pulsa para ver la respuesta'"
            (click)="flip()"
            (keydown.enter)="flip()"
            (keydown.space)="$event.preventDefault(); flip()"
          >
            <div class="flashcard-face absolute inset-0 flex flex-col rounded-3xl bg-[#FBF8F4] p-8 shadow-[0_12px_32px_-16px_rgba(62,59,51,0.3)] ring-1 ring-black/5">
              <span class="text-xs font-medium uppercase tracking-widest text-[#6B7A3A]">Pregunta</span>
              <p class="flex flex-1 items-center justify-center text-center text-xl font-medium leading-[1.5]">
                {{ currentCard().front }}
              </p>
            </div>
            <div class="flashcard-face flashcard-back absolute inset-0 flex flex-col rounded-3xl bg-[#F9E4E9] p-8 shadow-[0_12px_32px_-16px_rgba(62,59,51,0.3)] ring-1 ring-black/5">
              <span class="text-xs font-medium uppercase tracking-widest text-[#3E3B33]/70">Respuesta</span>
              <p class="flex flex-1 items-center justify-center text-center text-lg leading-[1.5]">
                {{ currentCard().back }}
              </p>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-between gap-3">
          <button
            type="button"
            (click)="previous()"
            [disabled]="isFirst() || isAnimating()"
            class="rounded-full bg-white px-4 py-2.5 text-sm font-medium text-[#3E3B33] ring-1 ring-black/10 transition-colors duration-200 hover:bg-[#F3EFE8] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white"
          >
            Anterior
          </button>
          <button
            type="button"
            (click)="flip()"
            [disabled]="isAnimating()"
            class="rounded-full bg-white px-5 py-2.5 text-sm font-medium text-[#3E3B33] ring-1 ring-black/10 transition-colors duration-200 hover:bg-[#F3EFE8] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white"
          >
            Voltear
          </button>
          <button
            type="button"
            (click)="next()"
            [disabled]="isLast() || isAnimating()"
            class="rounded-full bg-white px-4 py-2.5 text-sm font-medium text-[#3E3B33] ring-1 ring-black/10 transition-colors duration-200 hover:bg-[#F3EFE8] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white"
          >
            Siguiente
          </button>
        </div>

        <div class="flex h-11 items-center justify-center gap-3">
          @if (isFlipped()) {
            <button
              type="button"
              (click)="markReview()"
              [disabled]="isAnimating()"
              class="rounded-full bg-[#F6D6DD] px-5 py-2.5 text-sm font-medium text-[#3E3B33] transition-colors duration-200 hover:bg-[#F0C2CD] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Repasar
            </button>
            <button
              type="button"
              (click)="markKnown()"
              [disabled]="isAnimating()"
              class="rounded-full bg-[#6B7A3A] px-5 py-2.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-[#5A6831] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Lo sabía
            </button>
          }
        </div>

        <p class="text-center text-sm text-[#6F6B61]">
          Lo sabía: {{ knownCount() }} · Para repasar: {{ reviewCount() }}
        </p>
      }
    </section>
  `,
  styles: [
    `
      .flashcard-scene {
        perspective: 1200px;
      }

      .flashcard {
        transform-style: preserve-3d;
        transition: transform 600ms cubic-bezier(0.4, 0, 0.2, 1);
      }

      .flashcard.is-flipped {
        transform: rotateY(180deg);
      }

      .flashcard-face {
        backface-visibility: hidden;
        -webkit-backface-visibility: hidden;
      }

      .flashcard-back {
        transform: rotateY(180deg);
      }

      @media (prefers-reduced-motion: reduce) {
        .flashcard {
          transition: none;
        }
      }
    `,
  ],
})
export class FlashcardDemoComponent implements OnDestroy {
  private readonly flashcards = inject(FlashcardService);

  readonly subjectId = input.required<string>();
  readonly subjectName = computed(() => this.flashcards.subjects().find((subject) => subject.id === this.subjectId())?.name ?? '');
  readonly cards = computed(() => this.flashcards.cardsFor(this.subjectId()));

  readonly currentIndex = signal(0);
  readonly isFlipped = signal(false);
  readonly isAnimating = signal(false);
  readonly isFinished = signal(false);
  readonly knownCount = signal(0);
  readonly reviewCount = signal(0);

  readonly currentCard = computed(() => this.cards()[this.currentIndex()]);
  readonly isFirst = computed(() => this.currentIndex() === 0);
  readonly isLast = computed(() => this.currentIndex() === this.cards().length - 1);
  readonly progressLabel = computed(() => `${this.cards().length === 0 ? 0 : this.currentIndex() + 1} / ${this.cards().length}`);

  private navigationTimer: ReturnType<typeof setTimeout> | null = null;

  ngOnDestroy(): void {
    if (this.navigationTimer !== null) {
      clearTimeout(this.navigationTimer);
    }
  }

  flip(): void {
    if (this.isAnimating()) return;
    this.isFlipped.update((flipped) => !flipped);
  }

  previous(): void {
    if (this.isFirst()) return;
    this.navigateTo(this.currentIndex() - 1);
  }

  next(): void {
    if (this.isLast()) return;
    this.navigateTo(this.currentIndex() + 1);
  }

  markKnown(): void {
    this.knownCount.update((count) => count + 1);
    this.advance();
  }

  markReview(): void {
    this.reviewCount.update((count) => count + 1);
    this.advance();
  }

  restart(): void {
    this.knownCount.set(0);
    this.reviewCount.set(0);
    this.currentIndex.set(0);
    this.isFlipped.set(false);
    this.isFinished.set(false);
  }

  private advance(): void {
    if (this.isLast()) {
      this.isFinished.set(true);
      return;
    }
    this.navigateTo(this.currentIndex() + 1);
  }

  // Si la tarjeta está volteada, primero se gira de vuelta y luego se cambia el contenido,
  // para que la respuesta del nuevo término no se vea durante la animación.
  private navigateTo(index: number): void {
    if (!this.isFlipped()) {
      this.currentIndex.set(index);
      return;
    }

    this.isAnimating.set(true);
    this.isFlipped.set(false);
    this.navigationTimer = setTimeout(() => {
      this.currentIndex.set(index);
      this.isAnimating.set(false);
      this.navigationTimer = null;
    }, FLIP_DURATION_MS);
  }
}

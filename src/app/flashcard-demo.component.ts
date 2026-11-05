import { Component, OnDestroy, computed, signal } from '@angular/core';
import { KatexModule } from 'ng-katex-2';
import { CommonModule } from '@angular/common';

interface Flashcard {
  front: string;
  back: string;
}

const FLIP_DURATION_MS = 600;

@Component({
  selector: 'app-flashcard-demo',
  standalone: true,
  imports: [KatexModule, CommonModule],
  template: `
    <section class="mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-8 font-sans text-[#3E3B33]">
      <header class="flex items-center justify-between text-sm">
        <span class="font-medium text-[#6B7A3A]">Flashcards de ciencias</span>
        <span class="text-[#6F6B61]" aria-live="polite">{{ progressLabel() }}</span>
      </header>

      @if (isFinished()) {
        <div class="flex h-72 w-full flex-col items-center justify-center gap-4 rounded-3xl bg-[#FBF8F4] p-8 text-center shadow-[0_12px_32px_-16px_rgba(62,59,51,0.3)] ring-1 ring-black/5">
          <h2 class="text-2xl font-semibold leading-[1.2]">Mazo terminado</h2>
          <p class="text-base leading-[1.5] text-[#5F5B52]">
            Lo sabías: {{ knownCount() }} · Para repasar: {{ reviewCount() }}
          </p>
          <button (click)="restart()" class="mt-2 rounded-full bg-[#6B7A3A] px-5 py-2.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-[#5A6831]">
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
            (click)="flip()"
          >
            <!-- Frente -->
            <div class="flashcard-face absolute inset-0 flex flex-col rounded-3xl bg-[#FBF8F4] p-8 shadow-[0_12px_32px_-16px_rgba(62,59,51,0.3)] ring-1 ring-black/5 overflow-y-auto">
              <span class="text-xs font-medium uppercase tracking-widest text-[#6B7A3A] mb-4">Pregunta</span>
              <div class="flex flex-1 flex-col items-center justify-center text-center text-xl font-medium leading-[1.5]">
                
                @for (part of parseContent(currentCard().front); track $index) {
                  @if (part.isMath) {
                    <div class="my-2 text-2xl">
                      <ng-katex [equation]="part.content" [options]="{ displayMode: true }"></ng-katex>
                    </div>
                  } @else {
                    <span class="whitespace-pre-wrap">{{ part.content }}</span>
                  }
                }

              </div>
            </div>
            
            <!-- Reverso -->
            <div class="flashcard-face flashcard-back absolute inset-0 flex flex-col rounded-3xl bg-[#F9E4E9] p-8 shadow-[0_12px_32px_-16px_rgba(62,59,51,0.3)] ring-1 ring-black/5 overflow-y-auto">
              <span class="text-xs font-medium uppercase tracking-widest text-[#3E3B33]/70 mb-4">Respuesta</span>
              <div class="flex flex-1 flex-col items-center justify-center text-center text-lg leading-[1.5]">
                
                @for (part of parseContent(currentCard().back); track $index) {
                  @if (part.isMath) {
                    <div class="my-2 text-2xl">
                      <ng-katex [equation]="part.content" [options]="{ displayMode: true }"></ng-katex>
                    </div>
                  } @else {
                    <span class="whitespace-pre-wrap">{{ part.content }}</span>
                  }
                }

              </div>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-between gap-3">
          <button (click)="previous()" [disabled]="isFirst() || isAnimating()" class="rounded-full bg-white px-4 py-2.5 text-sm font-medium text-[#3E3B33] ring-1 ring-black/10 hover:bg-[#F3EFE8] disabled:opacity-40 disabled:hover:bg-white">Anterior</button>
          <button (click)="flip()" [disabled]="isAnimating()" class="rounded-full bg-white px-5 py-2.5 text-sm font-medium text-[#3E3B33] ring-1 ring-black/10 hover:bg-[#F3EFE8] disabled:opacity-40">Voltear</button>
          <button (click)="next()" [disabled]="isLast() || isAnimating()" class="rounded-full bg-white px-4 py-2.5 text-sm font-medium text-[#3E3B33] ring-1 ring-black/10 hover:bg-[#F3EFE8] disabled:opacity-40 disabled:hover:bg-white">Siguiente</button>
        </div>

        <div class="flex h-11 items-center justify-center gap-3">
          @if (isFlipped()) {
            <button (click)="markReview()" [disabled]="isAnimating()" class="rounded-full bg-[#F6D6DD] px-5 py-2.5 text-sm font-medium text-[#3E3B33] hover:bg-[#F0C2CD] disabled:opacity-40">Repasar</button>
            <button (click)="markKnown()" [disabled]="isAnimating()" class="rounded-full bg-[#6B7A3A] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#5A6831] disabled:opacity-40">Lo sabía</button>
          }
        </div>
      }
    </section>
  `,
  styles: [`
    .flashcard-scene { perspective: 1200px; }
    .flashcard { transform-style: preserve-3d; transition: transform 600ms cubic-bezier(0.4, 0, 0.2, 1); }
    .flashcard.is-flipped { transform: rotateY(180deg); }
    .flashcard-face { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
    .flashcard-back { transform: rotateY(180deg); }
    @media (prefers-reduced-motion: reduce) { .flashcard { transition: none; } }
  `]
})
export class FlashcardDemoComponent implements OnDestroy {
  // ... (Mantén tus propiedades cards, signals y métodos igual que antes)
  readonly cards: readonly Flashcard[] = [
    { front: '¿Qué es la fotosíntesis?', back: 'Proceso por el que las plantas convierten la luz solar en glucosa y oxígeno.' },
    { front: 'Área del círculo:', back: 'El área es $ \\pi r^2 $ donde r es el radio.' }
  ];

  readonly currentIndex = signal(0);
  readonly isFlipped = signal(false);
  readonly isAnimating = signal(false);
  readonly isFinished = signal(false);
  readonly knownCount = signal(0);
  readonly reviewCount = signal(0);

  readonly currentCard = computed(() => this.cards[this.currentIndex()]);
  readonly isFirst = computed(() => this.currentIndex() === 0);
  readonly isLast = computed(() => this.currentIndex() === this.cards.length - 1);
  readonly progressLabel = computed(() => `${this.currentIndex() + 1} / ${this.cards.length}`);

  private navigationTimer: any = null;

  // LA MAGIA ESTÁ AQUÍ: Busca específicamente el patrón $...$
  parseContent(text: string): { isMath: boolean, content: string }[] {
    if (!text) return [];
    // La expresión regular busca cualquier cosa entre dos signos de dólar
    const regex = /(\$[^$]+\$)/g;
    const parts = text.split(regex);
    
    return parts.filter(p => p !== '').map(part => {
      if (part.startsWith('$') && part.endsWith('$')) {
        return { isMath: true, content: part.slice(1, -1).trim() };
      }
      return { isMath: false, content: part };
    });
  }

  // ... (Mantén ngOnDestroy, flip, previous, next, markKnown, markReview, restart, advance, navigateTo exactamente igual)
  ngOnDestroy(): void { if (this.navigationTimer) clearTimeout(this.navigationTimer); }
  flip(): void { if (!this.isAnimating()) this.isFlipped.update(f => !f); }
  previous(): void { if (!this.isFirst()) this.navigateTo(this.currentIndex() - 1); }
  next(): void { if (!this.isLast()) this.navigateTo(this.currentIndex() + 1); }
  markKnown(): void { this.knownCount.update(c => c + 1); this.advance(); }
  markReview(): void { this.reviewCount.update(c => c + 1); this.advance(); }
  restart(): void { this.knownCount.set(0); this.reviewCount.set(0); this.currentIndex.set(0); this.isFlipped.set(false); this.isFinished.set(false); }
  private advance(): void { if (this.isLast()) { this.isFinished.set(true); return; } this.navigateTo(this.currentIndex() + 1); }
  private navigateTo(index: number): void {
    if (!this.isFlipped()) { this.currentIndex.set(index); return; }
    this.isAnimating.set(true); this.isFlipped.set(false);
    this.navigationTimer = setTimeout(() => { this.currentIndex.set(index); this.isAnimating.set(false); }, FLIP_DURATION_MS);
  }
}

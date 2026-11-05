import { Component, computed, input } from '@angular/core';
import { KatexComponent } from 'ng-katex-2';
import type { KatexOptions } from 'katex';

interface TextSegment {
  value: string;
  isFormula: boolean;
}

const FORMULA_PATTERN = /\$([^$]+)\$/;

@Component({
  selector: 'app-formula-text',
  standalone: true,
  imports: [KatexComponent],
  template: `
    @for (segment of segments(); track $index) {
      @if (segment.isFormula) {
        <ng-katex [equation]="segment.value" [options]="katexOptions" />
      } @else {
        <span>{{ segment.value }}</span>
      }
    }
  `,
})
export class FormulaTextComponent {
  readonly text = input.required<string>();

  readonly segments = computed<TextSegment[]>(() =>
    this.text()
      .split(FORMULA_PATTERN)
      .map((value, index) => ({ value, isFormula: index % 2 === 1 }))
      .filter((segment) => segment.value.length > 0),
  );

  readonly katexOptions: KatexOptions = { displayMode: false, throwOnError: false };
}

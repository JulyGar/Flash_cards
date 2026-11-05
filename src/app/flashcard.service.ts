import { Injectable, signal } from '@angular/core';

export interface Subject {
  id: string;
  name: string;
}

export interface Flashcard {
  front: string;
  back: string;
  subjectId: string;
}

interface StoredFlashcard {
  front: string;
  back: string;
  subjectId?: string;
}

const CARDS_STORAGE_KEY = 'flashsci.flashcards';
const SUBJECTS_STORAGE_KEY = 'flashsci.subjects';
const DEFAULT_SUBJECT_ID = 'biologia';

const INITIAL_SUBJECTS: readonly Subject[] = [
  { id: DEFAULT_SUBJECT_ID, name: 'Biología' },
  { id: 'quimica', name: 'Química' },
  { id: 'fisica', name: 'Física' },
];

const INITIAL_CARDS: readonly Flashcard[] = [
  {
    front: '¿Qué es la fotosíntesis?',
    back: 'Proceso por el que las plantas, algas y algunas bacterias convierten la luz solar, el agua y el dióxido de carbono en glucosa y oxígeno.',
    subjectId: DEFAULT_SUBJECT_ID,
  },
  {
    front: '¿Qué pigmento capta la luz en las plantas?',
    back: 'La clorofila, presente sobre todo en los cloroplastos de las hojas.',
    subjectId: DEFAULT_SUBJECT_ID,
  },
  {
    front: '¿Qué ecuación resume la fotosíntesis?',
    back: '6 CO₂ + 6 H₂O + luz → C₆H₁₂O₆ + 6 O₂',
    subjectId: DEFAULT_SUBJECT_ID,
  },
  {
    front: '¿Dónde ocurre la fotosíntesis dentro de la célula?',
    back: 'En los cloroplastos: las reacciones con luz ocurren en los tilacoides y el ciclo de Calvin en el estroma.',
    subjectId: DEFAULT_SUBJECT_ID,
  },
];

function isSubject(value: unknown): value is Subject {
  const subject = value as Partial<Subject>;
  return typeof value === 'object' && value !== null && typeof subject.id === 'string' && typeof subject.name === 'string';
}

function isStoredFlashcard(value: unknown): value is StoredFlashcard {
  if (typeof value !== 'object' || value === null) return false;
  const card = value as Partial<StoredFlashcard>;
  return (
    typeof card.front === 'string' &&
    typeof card.back === 'string' &&
    (card.subjectId === undefined || typeof card.subjectId === 'string')
  );
}

function normalizeName(name: string): string {
  return name.trim().toLocaleLowerCase('es');
}

function readJson(key: string): unknown {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? null : JSON.parse(raw);
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Sin acceso a localStorage (modo privado o cuota llena): los cambios siguen visibles en esta sesión.
  }
}

@Injectable({ providedIn: 'root' })
export class FlashcardService {
  readonly subjects = signal<readonly Subject[]>(this.loadSubjects());
  readonly cards = signal<readonly Flashcard[]>(this.loadCards());

  cardsFor(subjectId: string): readonly Flashcard[] {
    return this.cards().filter((card) => card.subjectId === subjectId);
  }

  countFor(subjectId: string): number {
    return this.cardsFor(subjectId).length;
  }

  hasSubjectNamed(name: string): boolean {
    const normalized = normalizeName(name);
    return this.subjects().some((subject) => normalizeName(subject.name) === normalized);
  }

  addSubject(name: string): Subject {
    const subject: Subject = { id: `materia-${Date.now().toString(36)}`, name: name.trim() };
    const next = [...this.subjects(), subject];
    this.subjects.set(next);
    writeJson(SUBJECTS_STORAGE_KEY, next);
    return subject;
  }

  deleteSubject(subjectId: string): void {
    const nextSubjects = this.subjects().filter((subject) => subject.id !== subjectId);
    const nextCards = this.cards().filter((card) => card.subjectId !== subjectId);
    this.subjects.set(nextSubjects);
    this.cards.set(nextCards);
    writeJson(SUBJECTS_STORAGE_KEY, nextSubjects);
    writeJson(CARDS_STORAGE_KEY, nextCards);
  }

  addCard(subjectId: string, front: string, back: string): void {
    const next = [...this.cards(), { front: front.trim(), back: back.trim(), subjectId }];
    this.cards.set(next);
    writeJson(CARDS_STORAGE_KEY, next);
  }

  private loadSubjects(): readonly Subject[] {
    const stored = readJson(SUBJECTS_STORAGE_KEY);
    if (!Array.isArray(stored) || !stored.every(isSubject)) {
      return INITIAL_SUBJECTS;
    }
    return stored;
  }

  private loadCards(): readonly Flashcard[] {
    const stored = readJson(CARDS_STORAGE_KEY);
    if (!Array.isArray(stored) || !stored.every(isStoredFlashcard)) {
      return INITIAL_CARDS;
    }
    // Las tarjetas guardadas antes de existir las materias pasan a Biología.
    return stored.map((card) => ({
      front: card.front,
      back: card.back,
      subjectId: card.subjectId ?? DEFAULT_SUBJECT_ID,
    }));
  }
}

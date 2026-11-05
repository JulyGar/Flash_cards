import { Component, Input, OnInit } from '@angular/core'; // <-- Añadido Input y OnInit
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-flashcard-creator',
  standalone: true,
  imports: [FormsModule, CommonModule],
  template: `
    <div class="max-w-md mx-auto p-6 bg-[#FAFAFA] rounded-3xl shadow-[0_12px_32px_-16px_rgba(62,59,51,0.3)] border border-gray-100 mt-6 font-sans text-[#3E3B33]">
      <h2 class="text-xl font-semibold mb-4 text-[#3E3B33]">Crear nueva tarjeta</h2>
      
      <div class="mb-4">
        <label class="block text-sm font-medium text-[#6B7A3A] mb-1">Materia</label>
        <select [(ngModel)]="subjectId" class="w-full rounded-xl border border-gray-300 shadow-sm p-3 focus:ring-[#6B7A3A] focus:border-[#6B7A3A] bg-white">
          <option value="" disabled selected>Selecciona una materia</option>
          <option value="biologia">Biología</option>
          <option value="quimica">Química</option>
          <option value="fisica">Física</option>
          <option value="matematicas">Matemáticas</option>
        </select>
      </div>

      <div class="mb-4">
        <label class="block text-sm font-medium text-[#6B7A3A] mb-1">Frente (Pregunta)</label>
        <textarea 
          [(ngModel)]="front" 
          rows="3" 
          placeholder="Escribe la pregunta aquí..."
          class="w-full rounded-xl border border-gray-300 shadow-sm p-3 focus:ring-[#6B7A3A] focus:border-[#6B7A3A] bg-white resize-none">
        </textarea>
      </div>

      <div class="mb-4">
        <label class="block text-sm font-medium text-[#6B7A3A] mb-1">Reverso (Respuesta)</label>
        <textarea 
          [(ngModel)]="back" 
          rows="3" 
          placeholder="Escribe la respuesta aquí..."
          class="w-full rounded-xl border border-gray-300 shadow-sm p-3 focus:ring-[#6B7A3A] focus:border-[#6B7A3A] bg-white resize-none">
        </textarea>
      </div>

      <p class="text-xs text-[#5F5B52] mb-5 bg-[#FBF8F4] p-3 rounded-xl border border-[#6B7A3A]/20 leading-relaxed">
        💡 <strong>Tip para fórmulas:</strong> Escribe tu ecuación entre signos de dólar.<br>
        Ejemplo: <code class="bg-white px-1 rounded border border-gray-200 text-[#6B7A3A]">$ x^2 $</code> o <code class="bg-white px-1 rounded border border-gray-200 text-[#6B7A3A]">$ a^2 + b^2 = c^2 $</code>
      </p>

      <button 
        (click)="saveCard()" 
        class="w-full bg-[#6B7A3A] text-white py-3 rounded-full font-medium hover:bg-[#5A6831] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6B7A3A]">
        Guardar Tarjeta
      </button>
    </div>
  `
})
export class FlashcardCreatorComponent implements OnInit { // <-- Implementa OnInit
  @Input() defaultSubjectId: string = ''; // <-- AÑADIDO AQUÍ

  subjectId = '';
  front = '';
  back = '';

  ngOnInit() {
    // Si viene una materia por defecto desde el componente padre, la selecciona
    if (this.defaultSubjectId) {
      this.subjectId = this.defaultSubjectId;
    }
  }

  saveCard() {
    if (!this.front || !this.back || !this.subjectId) {
      alert('Por favor, llena todos los campos.');
      return;
    }

    const existingCards = JSON.parse(localStorage.getItem('flashsci.flashcards') || '[]');
    existingCards.push({
      subjectId: this.subjectId,
      front: this.front,
      back: this.back
    });
    localStorage.setItem('flashsci.flashcards', JSON.stringify(existingCards));

    this.front = '';
    this.back = '';
    
    // Recargar la página
    window.location.reload();
  }
}
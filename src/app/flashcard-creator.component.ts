import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
// IMPORTANTE: Descomenta esta línea si tu servicio está en la misma carpeta
// import { FlashcardService } from './flashcard.service';

@Component({
  selector: 'app-flashcard-creator',
  standalone: true,
  imports: [FormsModule, CommonModule],
  template: `
    <div class="max-w-md mx-auto p-6 bg-[#FAFAFA] rounded-3xl shadow-[0_12px_32px_-16px_rgba(62,59,51,0.3)] border border-gray-100 mt-6 font-sans text-[#3E3B33]">
      <h2 class="text-xl font-semibold mb-4 text-[#3E3B33]">Crear nueva tarjeta</h2>
      
      <div class="mb-4">
        <label class="block text-sm font-medium text-[#6B7A3A] mb-1">Materia</label>
        <!-- Puedes cambiar estas opciones por las que tengas en tu servicio -->
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
        Ejemplo: <code class="bg-white px-1 rounded border border-gray-200 text-[#6B7A3A]">$ x^2 $</code> o <code class="bg-white px-1 rounded border border-gray-200 text-[#6B7A3A]">$ \\int_{0}^{1} x dx $</code>
      </p>

      <button 
        (click)="saveCard()" 
        class="w-full bg-[#6B7A3A] text-white py-3 rounded-full font-medium hover:bg-[#5A6831] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6B7A3A]">
        Guardar Tarjeta
      </button>
    </div>
  `
})
export class FlashcardCreatorComponent {
  // private flashcardService = inject(FlashcardService); // Descomenta si usas el servicio

  subjectId = '';
  front = '';
  back = '';

  saveCard() {
    // 1. Validar que no estén vacíos
    if (!this.front || !this.back || !this.subjectId) {
      alert('Por favor, llena todos los campos.');
      return;
    }

    // 2. Guardar en tu servicio (AQUÍ ESTÁ LA MAGIA)
    // Descomenta y adapta estas líneas según cómo se llame tu método en el servicio:
    /*
    this.flashcardService.addFlashcard({
      subjectId: this.subjectId,
      front: this.front,
      back: this.back
    });
    */

    // 3. (Opcional) Si usas localStorage directamente, podrías guardarlo así:
    const existingCards = JSON.parse(localStorage.getItem('flashsci.flashcards') || '[]');
    existingCards.push({
      subjectId: this.subjectId,
      front: this.front,
      back: this.back
    });
    localStorage.setItem('flashsci.flashcards', JSON.stringify(existingCards));

    // 4. Limpiar el formulario
    this.front = '';
    this.back = '';
    
    // Recargar la página para que se vea la nueva tarjeta (solución rápida sin tocar el servicio)
    window.location.reload();
  }
}

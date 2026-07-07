// script.js — Orquestador principal
// Conecta los cuatro módulos: constants, storage, inicio y combate.
// No contiene lógica propia del juego.

import { inicializarStorage }               from './storage.js';
import { inicializarInicio, mostrarInicio }  from './inicio.js';
import { inicializarCombate, iniciarCombate } from './combate.js';

// 1. Inicializar localStorage: carga datos guardados o crea las entradas iniciales
inicializarStorage();

// 2. Registrar los listeners del combate una sola vez
inicializarCombate();

// 3. Pintar tarjetas y registrar eventos de la vista de inicio
//    Le pasamos alCombatir como callback: se llama cuando el usuario hace click en "Combatir"
inicializarInicio(alCombatir);

// ─────────────────────────────────────────────
// Navegación entre vistas
// ─────────────────────────────────────────────

function alCombatir(indiceUsuario) {
  // Ocultar inicio, mostrar combate
  document.getElementById("vista-inicio").classList.add("oculto");
  document.getElementById("vista-combate").classList.remove("oculto");

  // Arrancar el combate; al terminar, volver al inicio
  iniciarCombate(indiceUsuario, mostrarInicio);
}

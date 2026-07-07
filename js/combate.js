// combate.js — Lógica de combate por turnos
import { pokemons } from './pokemons.js';
import { actualizarStats } from './storage.js';
import { urlImagen } from './constants.js';

// ─────────────────────────────────────────────
// Estado del combate en curso
// ─────────────────────────────────────────────
let pokemonUsuario = null;
let pokemonRival   = null;
let vidaUsuario    = 100;
let vidaRival      = 100;
let turnoUsuario   = true;

// Callback para volver al inicio cuando el combate termina
let _alTerminar = null;

// ─────────────────────────────────────────────
// Inicialización (se llama una sola vez al cargar la página)
// ─────────────────────────────────────────────

// Registra los listeners de los botones fijos de la vista de combate.
// Se llama una sola vez desde script.js para evitar listeners acumulados.
export function inicializarCombate() {

  // Botón "Lanzar poder": abre el modal para elegir un poder
  document.getElementById("btn-lanzar-poder").addEventListener("click", function() {
    if (!turnoUsuario) return;

    // Si no le quedan poderes, el usuario pierde automáticamente
    const poderesDisponibles = [];
    for (let k = 0; k < pokemonUsuario.poderes.length; k++) {
      if (pokemonUsuario.poderes[k].usos > 0) {
        poderesDisponibles.push(pokemonUsuario.poderes[k]);
      }
    }

    if (poderesDisponibles.length === 0) {
      terminarCombate(pokemonRival, pokemonUsuario);
      return;
    }

    // Actualizar botones del modal con nombre, daño y usos de cada poder
    for (let k = 0; k < pokemonUsuario.poderes.length; k++) {
      const poder = pokemonUsuario.poderes[k];
      const btn   = document.getElementById(`btn-poder-${k}`);
      btn.textContent    = `${poder.nombre} (daño: ${poder.energia} | usos: ${poder.usos})`;
      btn.disabled       = (poder.usos <= 0);
      btn.dataset.indice = k;
    }

    document.getElementById("modal-poder").classList.remove("oculto");
  });

  // Botones de poder: el usuario elige cuál usar
  const botonesPoder = document.querySelectorAll(".btn-poder");
  for (let p = 0; p < botonesPoder.length; p++) {
    botonesPoder[p].addEventListener("click", function() {
      const indicePoder = parseInt(this.dataset.indice);
      const poder       = pokemonUsuario.poderes[indicePoder];

      poder.usos--;

      // Animación de ataque en la imagen del usuario (0,5 s)
      const imgUsuario = document.getElementById("img-usuario");
      imgUsuario.classList.add("animacion-ataque");
      setTimeout(function() { imgUsuario.classList.remove("animacion-ataque"); }, 500);

      vidaRival = Math.max(0, vidaRival - poder.energia);
      actualizarVidas();
      document.getElementById("modal-poder").classList.add("oculto");

      if (vidaRival <= 0) {
        terminarCombate(pokemonUsuario, pokemonRival);
      } else {
        turnoUsuario = false;
        document.getElementById("mensaje-turno").textContent = "🤖 Turno del rival...";
        document.getElementById("btn-lanzar-poder").disabled = true;
        setTimeout(turnoRival, 1000);
      }
    });
  }

  // Cerrar modal de poderes sin hacer nada
  document.getElementById("btn-cerrar-poder").addEventListener("click", function() {
    document.getElementById("modal-poder").classList.add("oculto");
  });

  // Botón "Rendirme": el usuario pierde directamente
  document.getElementById("btn-rendirse").addEventListener("click", function() {
    terminarCombate(pokemonRival, pokemonUsuario);
  });

  // Botón "Volver al inicio" del modal de resultado
  document.getElementById("btn-resultado-continuar").addEventListener("click", function() {
    document.getElementById("modal-resultado").classList.add("oculto");
    document.getElementById("vista-combate").classList.add("oculto");
    document.getElementById("btn-lanzar-poder").disabled = false;

    // Llamar al callback para volver a la vista de inicio
    if (_alTerminar) _alTerminar();
  });
}

// ─────────────────────────────────────────────
// Arranque de un combate
// ─────────────────────────────────────────────

// Inicia un nuevo combate.
// Parámetros:
//   indiceUsuario → índice del pokemon elegido por el usuario
//   alTerminar    → callback para volver a la vista de inicio al terminar
export function iniciarCombate(indiceUsuario, alTerminar) {
  _alTerminar = alTerminar;

  // Sortear rival: do-while para garantizar que sea distinto al usuario
  let indiceRival;
  do {
    indiceRival = Math.floor(Math.random() * pokemons.length);
  } while (indiceRival === indiceUsuario);

  // Clonar pokémons para el combate (los usos y la vida se consumen solo en este combate)
  pokemonUsuario = clonarParaCombate(indiceUsuario);
  pokemonRival   = clonarParaCombate(indiceRival);

  // Inicializar vidas
  vidaUsuario = 100;
  vidaRival   = 100;

  // Pintar datos en la vista de combate (imágenes desde la PokeAPI)
  document.getElementById("img-usuario").src            = urlImagen(indiceUsuario);
  document.getElementById("nombre-usuario").textContent = pokemonUsuario.nombre;
  document.getElementById("img-rival").src              = urlImagen(indiceRival);
  document.getElementById("nombre-rival").textContent   = pokemonRival.nombre;
  actualizarVidas();

  // Sortear quién empieza
  turnoUsuario = Math.random() < 0.5;
  document.getElementById("btn-lanzar-poder").disabled = !turnoUsuario;

  if (turnoUsuario) {
    document.getElementById("mensaje-turno").textContent = "⚔️ ¡Tu turno!";
  } else {
    document.getElementById("mensaje-turno").textContent = "🤖 Turno del rival...";
    setTimeout(turnoRival, 2000);
  }
}

// ─────────────────────────────────────────────
// Funciones internas (no exportadas)
// ─────────────────────────────────────────────

// Crea una copia del pokemon para el combate con usos frescos
function clonarParaCombate(indice) {
  const original = pokemons[indice];
  const copia = {
    nombre:  original.nombre,
    indice:  indice,
    poderes: []
  };
  for (let k = 0; k < original.poderes.length; k++) {
    copia.poderes.push({
      nombre:  original.poderes[k].nombre,
      energia: original.poderes[k].energia,
      usos:    original.poderes[k].usos
    });
  }
  return copia;
}

// Actualiza los textos de % de vida en pantalla
function actualizarVidas() {
  document.getElementById("vida-usuario").textContent = vidaUsuario;
  document.getElementById("vida-rival").textContent   = vidaRival;
}

// Turno automático del rival (se llama con setTimeout)
function turnoRival() {
  // Filtrar poderes con usos disponibles
  const poderesDisponibles = [];
  for (let k = 0; k < pokemonRival.poderes.length; k++) {
    if (pokemonRival.poderes[k].usos > 0) {
      poderesDisponibles.push(pokemonRival.poderes[k]);
    }
  }

  // Si no le quedan poderes, el rival pierde
  if (poderesDisponibles.length === 0) {
    terminarCombate(pokemonUsuario, pokemonRival);
    return;
  }

  // Elegir un poder al azar
  const indicePoder = Math.floor(Math.random() * poderesDisponibles.length);
  const poder       = poderesDisponibles[indicePoder];

  poder.usos--;

  // La vida se resta de inmediato (se ve en pantalla enseguida)
  vidaUsuario = Math.max(0, vidaUsuario - poder.energia);
  actualizarVidas();

  // Animación de ataque en la imagen del rival (0,5 s)
  // El cambio de turno ocurre DENTRO del setTimeout:
  // el botón solo se habilita cuando la animación termina, no antes
  const imgRival = document.getElementById("img-rival");
  imgRival.classList.add("animacion-ataque");
  setTimeout(function() {
    imgRival.classList.remove("animacion-ataque");

    if (vidaUsuario <= 0) {
      terminarCombate(pokemonRival, pokemonUsuario);
    } else {
      turnoUsuario = true;
      document.getElementById("btn-lanzar-poder").disabled = false;
      document.getElementById("mensaje-turno").textContent = "⚔️ ¡Tu turno!";
    }
  }, 500);
}

// Fin del combate: actualiza stats y muestra el modal de resultado
function terminarCombate(ganador, perdedor) {
  actualizarStats(ganador, perdedor);

  const usuarioGano = (ganador.indice === pokemonUsuario.indice);
  document.getElementById("resultado-emoji").textContent       = usuarioGano ? "🏆" : "😞";
  document.getElementById("resultado-titulo").textContent      = usuarioGano ? "¡Ganaste!" : "¡Perdiste!";
  document.getElementById("resultado-descripcion").textContent = `${ganador.nombre} venció a ${perdedor.nombre}.`;

  document.getElementById("modal-resultado").classList.remove("oculto");
}

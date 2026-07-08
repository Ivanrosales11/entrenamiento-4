// inicio.js — Vista de inicio: tarjetas y modal Ver/Editar
// No genera HTML con innerHTML: usa los IDs que ya están en el index.html
import { pokemons } from './pokemons.js';
import { leerStorage, guardarStorage } from './storage.js';
import { urlImagen } from './constants.js';

// Estado interno de este módulo
let pokemonSeleccionado = -1; // índice del radio tildado (-1 = ninguno)
let indiceModalAbierto  = -1; // índice del pokemon abierto en el modal

// ─────────────────────────────────────────────
// Inicialización
// ─────────────────────────────────────────────

// Pinta las tarjetas y registra todos los eventos de la vista de inicio.
// Parámetros:
//   alCombatir → callback que se llama con el índice elegido al hacer click en "Combatir"
export function inicializarInicio(alCombatir) {

  // Pintar imagen y nombre en cada tarjeta (imagen desde la PokeAPI)
  for (let i = 0; i < pokemons.length; i++) {
    document.getElementById(`img-${i}`).src            = urlImagen(i);
    document.getElementById(`nombre-${i}`).textContent = pokemons[i].nombre;
  }

  // Radios: al tildar uno, guardar el índice y habilitar "Combatir"
  function alSeleccionarPokemon() {
    pokemonSeleccionado = parseInt(this.value);
    document.getElementById("btn-combatir").disabled = false;
  }

  const radios = document.querySelectorAll("input[name='pokemon-seleccionado']");
  for (let j = 0; j < radios.length; j++) {
    radios[j].addEventListener("change", alSeleccionarPokemon);
  }

  // Botones "Ver": abrir el modal con los datos del pokemon
  function alClickVerPokemon() {
    const indice = parseInt(this.dataset.indice);
    abrirModal(indice);
  }

  const botonesVer = document.querySelectorAll(".btn-ver");
  for (let v = 0; v < botonesVer.length; v++) {
    botonesVer[v].addEventListener("click", alClickVerPokemon);
  }

  // Botón "Guardar": guardar los cambios del modal en el array y en localStorage (con validación completa)
  function alGuardarModal() {
    const pk = pokemons[indiceModalAbierto];
    const errorEl = document.getElementById("modal-error");

    // Validar nombre del pokémon
    const nuevoNombre = document.getElementById("modal-nombre").value.trim();
    if (nuevoNombre === "") {
      errorEl.textContent = "El nombre del Pokémon no puede estar vacío.";
      errorEl.classList.remove("oculto");
      return;
    }

    // Validar cada poder antes de guardar nada
    const nuevosPoderes = [];
    for (let k = 0; k < pk.poderes.length; k++) {
      const nomPoder = document.getElementById(`modal-poder${k}-nombre`).value.trim();
      const usos     = parseInt(document.getElementById(`modal-poder${k}-usos`).value);
      const energia  = parseInt(document.getElementById(`modal-poder${k}-energia`).value);

      if (nomPoder === "") {
        errorEl.textContent = "Los nombres de los poderes no pueden estar vacíos.";
        errorEl.classList.remove("oculto");
        return;
      }

      if (Number.isNaN(usos) || usos <= 0) {
        errorEl.textContent = "Los usos de los poderes deben ser mayores a 0.";
        errorEl.classList.remove("oculto");
        return;
      }

      if (Number.isNaN(energia) || energia <= 0) {
        errorEl.textContent = "La energía (daño) de los poderes debe ser mayor a 0.";
        errorEl.classList.remove("oculto");
        return;
      }

      nuevosPoderes.push({ nombre: nomPoder, usos, energia });
    }

    // Si todo es válido, aplicar los cambios en memoria
    pk.nombre = nuevoNombre;
    for (let k = 0; k < pk.poderes.length; k++) {
      pk.poderes[k].nombre  = nuevosPoderes[k].nombre;
      pk.poderes[k].usos    = nuevosPoderes[k].usos;
      pk.poderes[k].energia = nuevosPoderes[k].energia;
    }

    guardarStorage(indiceModalAbierto);
    document.getElementById(`nombre-${indiceModalAbierto}`).textContent = pk.nombre;
    document.getElementById("modal-ver").classList.add("oculto");
  }

  // Botón "Cerrar": ocultar el modal sin guardar nada
  function alCerrarModal() {
    document.getElementById("modal-ver").classList.add("oculto");
  }

  document.getElementById("btn-guardar").addEventListener("click", alGuardarModal);
  document.getElementById("btn-cerrar-ver").addEventListener("click", alCerrarModal);

  // Botón "Combatir": avisar al main cuál pokemon eligió el usuario
  document.getElementById("btn-combatir").addEventListener("click", function() {
    alCombatir(pokemonSeleccionado);
  });
}

// ─────────────────────────────────────────────
// Volver a la vista de inicio
// ─────────────────────────────────────────────

// Resetea el estado y muestra la vista de inicio.
// Se usa como callback de "alTerminar" en combate.js.
export function mostrarInicio() {
  // Deseleccionar todos los radios
  const radiosReset = document.querySelectorAll("input[name='pokemon-seleccionado']");
  for (let r = 0; r < radiosReset.length; r++) {
    radiosReset[r].checked = false;
  }

  pokemonSeleccionado = -1;
  document.getElementById("btn-combatir").disabled = true;
  document.getElementById("vista-inicio").classList.remove("oculto");
}

// ─────────────────────────────────────────────
// Modal Ver / Editar (función interna, no exportada)
// ─────────────────────────────────────────────

function abrirModal(indice) {
  indiceModalAbierto = indice;
  const pk = pokemons[indice];

  // Ocultar mensajes de error previos
  const errorEl = document.getElementById("modal-error");
  errorEl.classList.add("oculto");
  errorEl.textContent = "";

  document.getElementById("modal-img").src      = urlImagen(indice);
  document.getElementById("modal-nombre").value = pk.nombre;

  for (let k = 0; k < pk.poderes.length; k++) {
    document.getElementById(`modal-poder${k}-nombre`).value  = pk.poderes[k].nombre;
    document.getElementById(`modal-poder${k}-usos`).value    = pk.poderes[k].usos;
    document.getElementById(`modal-poder${k}-energia`).value = pk.poderes[k].energia;
  }

  // Estadísticas desde localStorage
  const datos = leerStorage(indice);
  document.getElementById("modal-stats").textContent =
    `Combates: ${datos.combates} | Ganados: ${datos.ganados} | Perdidos: ${datos.perdidos}`;

  document.getElementById("modal-ver").classList.remove("oculto");
}

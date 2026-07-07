// storage.js — Todo lo relacionado con localStorage
// Estructura de cada entrada: { nombre, poderes, combates, ganados, perdidos }
// Clave: "pokemon_0", "pokemon_1", etc. (por índice, nunca por nombre)
import { pokemons } from './pokemons.js';

// ─────────────────────────────────────────────
// Leer y escribir
// ─────────────────────────────────────────────

// Lee el objeto completo de un pokemon desde localStorage.
// Si todavía no existe, devuelve los valores por defecto del código.
export function leerStorage(indice) {
  const guardado = localStorage.getItem(`pokemon_${indice}`);
  if (guardado) return JSON.parse(guardado);
  return {
    nombre:   pokemons[indice].nombre,
    poderes:  pokemons[indice].poderes,
    combates: 0,
    ganados:  0,
    perdidos: 0
  };
}

// Guarda nombre + poderes del pokemon, conservando sus stats actuales.
// Se llama desde inicio.js cuando el usuario hace click en "Guardar".
export function guardarStorage(indice) {
  const pk     = pokemons[indice];
  const actual = leerStorage(indice); // leer para no pisar las stats
  localStorage.setItem(`pokemon_${indice}`, JSON.stringify({
    nombre:   pk.nombre,
    poderes:  pk.poderes,
    combates: actual.combates,
    ganados:  actual.ganados,
    perdidos: actual.perdidos
  }));
}

// Actualiza las estadísticas de combate del ganador y el perdedor.
// Se llama desde combate.js al terminar cada combate.
export function actualizarStats(ganador, perdedor) {
  const datosGanador = leerStorage(ganador.indice);
  datosGanador.combates++;
  datosGanador.ganados++;
  localStorage.setItem(`pokemon_${ganador.indice}`, JSON.stringify(datosGanador));

  const datosPerdedor = leerStorage(perdedor.indice);
  datosPerdedor.combates++;
  datosPerdedor.perdidos++;
  localStorage.setItem(`pokemon_${perdedor.indice}`, JSON.stringify(datosPerdedor));
}

// ─────────────────────────────────────────────
// Inicialización al arrancar la página
// ─────────────────────────────────────────────

// Para cada pokemon:
// - Si ya tiene datos guardados → los carga al array en memoria
// - Si no tiene datos → crea la entrada inicial con los valores de pokemons.js
export function inicializarStorage() {
  for (let i = 0; i < pokemons.length; i++) {
    const guardado = localStorage.getItem(`pokemon_${i}`);

    if (guardado) {
      const datos = JSON.parse(guardado);
      pokemons[i].nombre  = datos.nombre;
      pokemons[i].poderes = datos.poderes;
    } else {
      localStorage.setItem(`pokemon_${i}`, JSON.stringify({
        nombre:   pokemons[i].nombre,
        poderes:  pokemons[i].poderes,
        combates: 0,
        ganados:  0,
        perdidos: 0
      }));
    }
  }
}

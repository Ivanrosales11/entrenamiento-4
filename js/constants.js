// constants.js — Valores fijos del juego
// Si mañana cambia una URL o un número, se toca solo este archivo.

// URL base del artwork oficial de la PokeAPI (sprite de alta calidad en GitHub)
// No requiere fetch ni API key: es una URL directa a la imagen
export const URL_ARTWORK =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork";

// Número de pokédex de cada pokemon, en el mismo orden que pokemons.js
// Usamos índice (no nombre) como clave: el nombre es editable, el índice no cambia
export const NUMEROS_POKEDEX = [
  1,  // índice 0 → Bulbasaur
  4,  // índice 1 → Charmander
  7,  // índice 2 → Squirtle
  25  // índice 3 → Pikachu
];

// Genera la URL completa de la imagen a partir del índice del pokemon
// Ejemplo: urlImagen(0) → ".../1.png" (Bulbasaur)
export function urlImagen(indice) {
  return `${URL_ARTWORK}/${NUMEROS_POKEDEX[indice]}.png`;
}

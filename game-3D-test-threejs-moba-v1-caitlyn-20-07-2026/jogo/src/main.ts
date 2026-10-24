import { Game } from './Game';

window.addEventListener('DOMContentLoaded', () => {
  const game = new Game();
  // Para fins de depuração no console do navegador
  (window as any).game = game;
});

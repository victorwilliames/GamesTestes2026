import { Game } from './game/Game';

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
  if (canvas) {
    const game = new Game(canvas);
    
    // Expor globalmente apenas para depuração se necessário
    (window as any).game = game;
  } else {
    console.error('Elemento canvas do jogo não encontrado!');
  }
});

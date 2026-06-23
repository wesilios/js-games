import { game } from './game.ts';

game.init();

if (import.meta.hot) {
  (import.meta.hot.accept('./game.ts'),
    (newModule) => {
      const currentState = { ...game.state };
      newModule.hotUpdate(currentState);
    });
}

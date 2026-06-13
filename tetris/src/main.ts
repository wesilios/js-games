import { init, state, hotUpdate } from './game.ts';

init();

if (import.meta.hot) {
  (import.meta.hot.accept('./game.ts'),
    (newModule) => {
      const currentState = { ...state };
      newModule.hotUpdate(currentState);
    });
}

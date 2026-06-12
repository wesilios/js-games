import './style.css';
import { init, hotUpdate, state } from './game.js';

init();

if (import.meta.hot) {
  import.meta.hot.accept('./game.js', (newModule) => {
    const currentState = { ...state };
    newModule.hotUpdate(currentState);
  });
}

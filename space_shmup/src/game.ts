export interface GameState {}

export let state: GameState = {};

export const hotUpdate = (oldState: GameState): void => {
  if (!oldState) {
    state = oldState;
  }
};

export const init = (): void => {};

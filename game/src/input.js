// input.js — keyboard and mouse/pointer input for the turkey.
// Arrow keys / Space jump, Down/S duck and hide, R restart, P pause, M mute.
// Clicking (or tapping) the canvas also jumps. Nothing here touches the network.
export function createInput(canvas) {
  const state = {
    jumpPressed: false,
    jumpHeld: false,
    duckHeld: false,
    restartPressed: false,
    pausePressed: false,
    mutePressed: false,
    anyPressed: false,
    pointerX: 0,
    pointerY: 0,
  };

  function onKeyDown(event) {
    const key = event.key;
    if (key === ' ' || key === 'ArrowUp' || key === 'w' || key === 'W') {
      if (!event.repeat) state.jumpPressed = true;
      state.jumpHeld = true;
      state.anyPressed = true;
      event.preventDefault();
    } else if (key === 'ArrowDown' || key === 's' || key === 'S') {
      state.duckHeld = true;
      state.anyPressed = true;
      event.preventDefault();
    } else if (key === 'r' || key === 'R') {
      state.restartPressed = true;
      state.anyPressed = true;
    } else if (key === 'p' || key === 'P') {
      state.pausePressed = true;
    } else if (key === 'm' || key === 'M') {
      state.mutePressed = true;
    } else if (key === 'Enter') {
      state.anyPressed = true;
    }
  }

  function onKeyUp(event) {
    const key = event.key;
    if (key === ' ' || key === 'ArrowUp' || key === 'w' || key === 'W') state.jumpHeld = false;
    if (key === 'ArrowDown' || key === 's' || key === 'S') state.duckHeld = false;
  }

  function onPointerDown(event) {
    const rect = canvas.getBoundingClientRect();
    state.pointerX = event.clientX - rect.left;
    state.pointerY = event.clientY - rect.top;
    state.jumpPressed = true;
    state.anyPressed = true;
  }

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  canvas.addEventListener('pointerdown', onPointerDown);

  // Edge-triggered flags are consumed once per frame by the game loop.
  state.consume = function consume() {
    const pressed = {
      jump: state.jumpPressed,
      restart: state.restartPressed,
      pause: state.pausePressed,
      mute: state.mutePressed,
      any: state.anyPressed,
    };
    state.jumpPressed = false;
    state.restartPressed = false;
    state.pausePressed = false;
    state.mutePressed = false;
    state.anyPressed = false;
    return pressed;
  };

  return state;
}

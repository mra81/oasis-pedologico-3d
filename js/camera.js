/* =========================================================
   CAMERA — órbita em terceira pessoa + zoom para o Visor Nano
   ========================================================= */
(function () {
  const C = OP.CONFIG.camera;

  let camera = null;
  let yaw = 0;
  let pitch = C.pitch;
  let dist = C.dist;
  let currentDist = C.dist;

  const look = new THREE.Vector3();
  const desired = new THREE.Vector3();
  const tmp = new THREE.Vector3();

  let focusPos = null;
  let focusCb = null;
  let focusTime = 0;
  let focusDone = false;

  OP.CameraRig = {
    init(cam) {
      camera = cam;
      yaw = 0;
      pitch = C.pitch;
      dist = C.dist;
      currentDist = C.dist;
    },

    get yaw() { return yaw; },
    get isFocusing() { return !!focusPos; },

    rotate(dx, dy) {
      yaw -= dx * 0.005;
      pitch = THREE.MathUtils.clamp(pitch + dy * 0.004, C.minPitch, C.maxPitch);
    },

    zoom(delta) {
      dist = THREE.MathUtils.clamp(dist + delta * 0.012, C.minDist, C.maxDist);
    },

    focus(pos, cb) {
      focusPos = pos.clone();
      focusCb = cb || null;
      focusTime = 0;
      focusDone = false;
    },

    release() {
      focusPos = null;
      focusCb = null;
    },

    update(dt, playerPos) {
      if (focusPos) {
        desired.set(focusPos.x, focusPos.y + 1.2, focusPos.z);
        focusTime += dt;
        if (!focusDone && focusTime > 0.4) {
          focusDone = true;
          if (focusCb) focusCb();
        }
      } else {
        desired.set(playerPos.x, playerPos.y + 1.5, playerPos.z);
      }

      look.lerp(desired, Math.min(1, dt * (focusPos ? 10 : 7)));

      // Em telas estreitas (retrato) a câmera recua para o avatar não dominar o quadro.
      const aspect = camera.aspect || 1;
      const fit = aspect < 1 ? Math.min(1.85, 1 / Math.max(aspect, 0.55)) : 1;
      const targetDist = focusPos ? 5.2 * fit : dist * fit;
      currentDist += (targetDist - currentDist) * Math.min(1, dt * 6);

      const cp = Math.cos(pitch);
      tmp.set(
        Math.sin(yaw) * cp * currentDist,
        Math.sin(pitch) * currentDist,
        Math.cos(yaw) * cp * currentDist
      );

      camera.position.copy(look).add(tmp);

      // não deixa a câmera entrar no terreno (encosta e ravinas)
      if (OP.World && OP.World.heightAt) {
        const floor = OP.World.heightAt(camera.position.x, camera.position.z) + 1.1;
        if (camera.position.y < floor) camera.position.y = floor;
      }

      camera.lookAt(look.x, look.y + 0.3, look.z);
    },
  };
})();

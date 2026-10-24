/* ==========================================================
   GET FADES — welcome.js
   3D barber pole (Three.js) na welcome screen.
   - Patay at madilim sa simula. I-click ang plug (o ang
     "Plug it in" button) para sumaksak: iilaw at iikot.
   - Lalabas ang "Enter site" pagkatapos umilaw.
   - Isang beses lang kada session (sessionStorage)
   - Skip agad kapag reduce-motion o walang WebGL
   ========================================================== */
(function () {
  "use strict";

  var root = document.getElementById("welcome");
  if (!root) return;

  var KEY = "gf-welcome-seen";
  var COLORS = ["#d41f2a", "#f5f5f5", "#1f4fd1", "#f5f5f5"]; // 4 stripes
  var SPIN_SPEED = 1.1;   // mas malaki = mas mabilis ang ikot
  var CAM_Z = 12.5;       // mas maliit = mas malaki ang pole
  var LOGO_SRC = "public/images/shop/logo.png"; // palitan kung iba ang path mo
  var LOGO_HEIGHT = 0.36; // laki ng logo sa takip

  var stage = document.getElementById("welcome-stage");
  var enterBtn = document.getElementById("welcome-enter");

  function markSeen() { try { sessionStorage.setItem(KEY, "1"); } catch (e) {} }
  function removeNow() {
    if (root.parentNode) root.parentNode.removeChild(root);
    document.body.classList.remove("is-locked");
  }

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var seen = document.documentElement.classList.contains("welcome-seen");
  if (reduce || seen || !window.THREE || !stage || !enterBtn) { removeNow(); return; }

  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  } catch (err) {
    removeNow();
    return;
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.domElement.className = "welcome__canvas";
  stage.appendChild(renderer.domElement);
  document.body.classList.add("is-locked");

  /* ---------- Hint button (nasa ilalim, pinapalitan ng Enter site) ---------- */
  var hint = document.createElement("button");
  hint.type = "button";
  hint.className = "btn btn--outline welcome__plug";
  hint.textContent = "Plug it in";
  hint.setAttribute("aria-label", "Plug in the barber pole to turn it on");
  hint.classList.add("is-pulsing");
  enterBtn.parentNode.insertBefore(hint, enterBtn.nextSibling);
  enterBtn.hidden = true;

  /* ---------- Scene ---------- */
  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0.5, -0.12, CAM_Z);

  var ambient = new THREE.AmbientLight(0xffffff, 0.35);
  scene.add(ambient);
  var keyLight = new THREE.DirectionalLight(0xffffff, 0.85);
  keyLight.position.set(4, 5, 6);
  scene.add(keyLight);
  var rimLight = new THREE.DirectionalLight(0xffffff, 0.6);
  rimLight.position.set(-5, 2, -3);
  scene.add(rimLight);
  var fill = new THREE.PointLight(0xffffff, 0.8, 30);
  fill.position.set(-3, -2, 6);
  scene.add(fill);

  /* ---------- Glow sa likod (lalabas kapag naka-on) ---------- */
  function glowTexture() {
    var c = document.createElement("canvas");
    c.width = c.height = 256;
    var g = c.getContext("2d");
    var gr = g.createRadialGradient(128, 128, 0, 128, 128, 128);
    gr.addColorStop(0, "rgba(255,255,255,0.9)");
    gr.addColorStop(0.4, "rgba(255,255,255,0.25)");
    gr.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = gr;
    g.fillRect(0, 0, 256, 256);
    return new THREE.CanvasTexture(c);
  }
  var glowTex = glowTexture();
  var glow = new THREE.Sprite(new THREE.SpriteMaterial({
    map: glowTex, color: 0xdfe8ff, transparent: true, opacity: 0,
    blending: THREE.AdditiveBlending, depthWrite: false
  }));
  glow.scale.set(8, 9.5, 1);
  glow.position.set(0, 0, -1.5);
  scene.add(glow);

  /* ---------- Stripe texture (diagonal, seamless) ---------- */
  function makeStripeTexture() {
    var c = document.createElement("canvas");
    c.width = c.height = 512;
    var g = c.getContext("2d");
    g.fillStyle = "#f5f5f5";
    g.fillRect(0, 0, 512, 512);
    var w = 512 / COLORS.length;
    for (var i = 0; i < COLORS.length; i++) {
      g.fillStyle = COLORS[i];
      for (var k = -1; k <= 1; k++) {
        var x = i * w + k * 512;
        g.beginPath();
        g.moveTo(x, 0);
        g.lineTo(x + w, 0);
        g.lineTo(x + w + 512, 512);
        g.lineTo(x + 512, 512);
        g.closePath();
        g.fill();
      }
    }
    var t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(1, 1.6);
    t.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    return t;
  }

  /* ---------- Pole ---------- */
  var H = 4.4;   // taas ng glass
  var R = 0.55;  // radius ng stripes
  var pole = new THREE.Group();   // tilt (mouse)
  var body = new THREE.Group();   // pang-center
  body.position.y = -0.48;
  pole.add(body);
  scene.add(pole);

  var tex = makeStripeTexture();
  // Patay sa simula: madilim ang kulay, walang emissive
  var innerMat = new THREE.MeshPhongMaterial({
    map: tex, shininess: 40, specular: 0x444444,
    emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: 0
  });
  innerMat.color.setRGB(0.28, 0.28, 0.28);
  var inner = new THREE.Mesh(new THREE.CylinderGeometry(R, R, H, 64, 1, true), innerMat);
  body.add(inner);

  var glass = new THREE.Mesh(
    new THREE.CylinderGeometry(R + 0.06, R + 0.06, H, 64, 1, true),
    new THREE.MeshPhongMaterial({
      color: 0xffffff, transparent: true, opacity: 0.16,
      shininess: 120, specular: 0xffffff, depthWrite: false
    })
  );
  body.add(glass);

  // Reflection streaks sa glass
  [[-0.3, 0.07, 0.6], [0.34, 0.035, 0.35]].forEach(function (s) {
    var rg = R + 0.07;
    var streak = new THREE.Mesh(
      new THREE.PlaneGeometry(s[1], H * 0.86),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: s[2], depthWrite: false })
    );
    streak.position.set(s[0], 0, Math.sqrt(rg * rg - s[0] * s[0]) + 0.005);
    streak.rotation.y = Math.asin(s[0] / rg);
    body.add(streak);
  });

  var chrome = new THREE.MeshPhongMaterial({ color: 0x7d8087, specular: 0xffffff, shininess: 90 });
  function part(geo, y) {
    var m = new THREE.Mesh(geo, chrome);
    m.position.y = y;
    body.add(m);
    return m;
  }
  var half = H / 2;
  part(new THREE.CylinderGeometry(0.72, 0.72, 0.28, 48), -half - 0.06);          // collar baba
  part(new THREE.CylinderGeometry(0.8, 0.95, 0.5, 48), -half - 0.45);            // base
  part(new THREE.CylinderGeometry(0.72, 0.72, 0.28, 48), half + 0.06);           // collar taas
  part(new THREE.CylinderGeometry(0.95, 0.8, 0.5, 48), half + 0.45);             // takip
  part(new THREE.SphereGeometry(0.8, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2), half + 0.7); // dome
  part(new THREE.SphereGeometry(0.13, 20, 20), half + 1.5);                       // knob
  [half - 0.02, -half + 0.02].forEach(function (y) {
    var ring = part(new THREE.TorusGeometry(0.68, 0.05, 16, 56), y);
    ring.rotation.x = Math.PI / 2;
  });

  /* ---------- Logo sa takip (taas) ---------- */
  new THREE.TextureLoader().load(LOGO_SRC, function (logoTex) {
    var img = logoTex.image;
    var aspect = img.width / img.height;
    var bandH = 0.5;
    var f0 = 0.5 - LOGO_HEIGHT / bandH / 2;
    var f1 = 0.5 + LOGO_HEIGHT / bandH / 2;
    var rB = 0.8 + 0.15 * f0 + 0.012;
    var rT = 0.8 + 0.15 * f1 + 0.012;
    var arc = Math.min(LOGO_HEIGHT * aspect / ((rB + rT) / 2), 2.0);
    logoTex.anisotropy = 8;
    var decal = new THREE.Mesh(
      new THREE.CylinderGeometry(rT, rB, LOGO_HEIGHT, 48, 1, true, -arc / 2, arc),
      new THREE.MeshBasicMaterial({ map: logoTex, transparent: true, depthWrite: false })
    );
    decal.position.y = half + 0.45;
    body.add(decal);
  });

  /* ---------- Saksakan (outlet) + plug + wire ---------- */
  var OUTLET_POS = new THREE.Vector3(1.9, -2.2, -0.1);
  var PLUGGED_POS = new THREE.Vector3(1.9, -2.2, 0.28);
  var UNPLUGGED_POS = new THREE.Vector3(1.5, -2.9, 0.7);
  var UNPLUGGED_ROT = new THREE.Vector3(-0.3, 2.2, 0.5);
  var CORD_START = new THREE.Vector3(0.86, -3.05, 0.1);

  var plateMat = new THREE.MeshPhongMaterial({ color: 0x3b3c40, specular: 0x222222, shininess: 20 });
  var slotMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
  var plate = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.1, 0.08), plateMat);
  plate.position.copy(OUTLET_POS);
  scene.add(plate);
  [-0.09, 0.09].forEach(function (x) {
    var slot = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.16, 0.01), slotMat);
    slot.position.set(OUTLET_POS.x + x, OUTLET_POS.y + 0.04, OUTLET_POS.z + 0.045);
    scene.add(slot);
  });
  var groundHole = new THREE.Mesh(new THREE.CircleGeometry(0.045, 20), slotMat);
  groundHole.position.set(OUTLET_POS.x, OUTLET_POS.y - 0.2, OUTLET_POS.z + 0.045);
  scene.add(groundHole);

  var plug = new THREE.Group();
  var plugBody = new THREE.Mesh(
    new THREE.BoxGeometry(0.36, 0.44, 0.28),
    new THREE.MeshPhongMaterial({ color: 0xb9bbc0, specular: 0x555555, shininess: 50 })
  );
  plug.add(plugBody);
  var prongMat = new THREE.MeshPhongMaterial({ color: 0xc9ccd1, specular: 0xffffff, shininess: 120 });
  [-0.09, 0.09].forEach(function (x) {
    var prong = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.17, 0.2), prongMat);
    prong.position.set(x, 0.04, -0.24);
    plug.add(prong);
  });
  // Malaking invisible hit area para madaling i-click/tap
  var hit = new THREE.Mesh(
    new THREE.SphereGeometry(0.75, 8, 8),
    new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
  );
  plug.add(hit);
  plug.position.copy(UNPLUGGED_POS);
  plug.rotation.set(UNPLUGGED_ROT.x, UNPLUGGED_ROT.y, UNPLUGGED_ROT.z);
  scene.add(plug);

  var cordMesh = new THREE.Mesh(
    new THREE.BufferGeometry(),
    new THREE.MeshPhongMaterial({ color: 0x8a8a8a, shininess: 30 })
  );
  scene.add(cordMesh);
  function buildCord() {
    var end = plug.position.clone().add(new THREE.Vector3(0, -0.25, 0));
    var mid = CORD_START.clone().add(end).multiplyScalar(0.5).add(new THREE.Vector3(0.05, -0.2, 0.4));
    var curve = new THREE.CatmullRomCurve3([CORD_START, mid, end]);
    cordMesh.geometry.dispose();
    cordMesh.geometry = new THREE.TubeGeometry(curve, 36, 0.035, 6, false);
  }
  buildCord();

  /* ---------- Power state ---------- */
  var moving = false;    // gumagalaw ang plug
  var dir = 1;           // 1 = sasaksak, -1 = tatanggalin
  var plugged = false;   // nakasaksak
  var powerOn = false;   // may kuryente
  var plugT = 0;
  var poweredAt = 0;
  var level = 0;         // liwanag (0 hanggang 1)
  var spin = 0;

  function ease(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }

  function applyPower(l) {
    innerMat.emissiveIntensity = 0.5 * l;
    var c = 0.28 + 0.72 * l;
    innerMat.color.setRGB(c, c, c);
    glow.material.opacity = 0.32 * l;
    ambient.intensity = 0.35 + 0.2 * l;
  }

  function updatePlug() {
    var e = ease(plugT);
    plug.position.lerpVectors(UNPLUGGED_POS, PLUGGED_POS, e);
    plug.position.y += Math.sin(e * Math.PI) * 0.25;
    plug.rotation.x = UNPLUGGED_ROT.x * (1 - e);
    plug.rotation.y = UNPLUGGED_ROT.y * (1 - e);
    plug.rotation.z = UNPLUGGED_ROT.z * (1 - e);
    buildCord();
  }

  function togglePlug() {
    if (moving) return;
    moving = true;
    dir = plugged ? -1 : 1;
    hint.disabled = true;
    hint.classList.remove("is-pulsing");
    hint.textContent = dir > 0 ? "Plugging in..." : "Unplugging...";
    renderer.domElement.style.cursor = "";
    if (dir < 0) { plugged = false; powerOn = false; } // putol agad ang kuryente
  }

  function onPowered() {
    hint.textContent = "Unplug";
    hint.disabled = false;
    if (enterBtn.hidden) {
      enterBtn.hidden = false;
      enterBtn.classList.add("is-shown");
      try { enterBtn.focus({ preventScroll: true }); } catch (err) {}
    }
  }

  function onUnplugged() {
    hint.textContent = "Plug it in";
    hint.disabled = false;
    hint.classList.add("is-pulsing");
  }

  hint.addEventListener("click", togglePlug);

  /* ---------- Interaction ---------- */
  var raycaster = new THREE.Raycaster();
  var ndc = new THREE.Vector2();
  function overPlug(e) {
    var rect = renderer.domElement.getBoundingClientRect();
    ndc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    ndc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(ndc, camera);
    return raycaster.intersectObject(hit, false).length > 0;
  }

  var tx = 0, ty = 0, cx = 0, cy = 0;
  window.addEventListener("pointermove", function (e) {
    tx = (e.clientX / window.innerWidth - 0.5) * 2;
    ty = (e.clientY / window.innerHeight - 0.5) * 2;
    if (!moving) {
      renderer.domElement.style.cursor = overPlug(e) ? "pointer" : "";
    }
  }, { passive: true });
  renderer.domElement.addEventListener("pointerdown", function (e) {
    if (!moving && overPlug(e)) togglePlug();
  });

  function resize() {
    var w = stage.clientWidth;
    var h = stage.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.position.z = Math.max(CAM_Z, 10 / camera.aspect); // para kita pa rin ang saksakan sa phone
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener("resize", resize);
  window.addEventListener("load", resize);

  /* ---------- Loop ---------- */
  var running = true;
  var raf = 0;
  var last = 0;
  var born = 0;

  function frame(t) {
    if (!running) return;
    if (!born) born = t;
    var dt = Math.min((t - (last || t)) / 1000, 0.05);
    last = t;

    if (moving) {
      plugT = Math.min(1, Math.max(0, plugT + dir * dt / 0.7));
      updatePlug();
      if (dir > 0 && plugT >= 1) {
        moving = false;
        plugged = true;
        powerOn = true;
        poweredAt = t;
        onPowered();
      } else if (dir < 0 && plugT <= 0) {
        moving = false;
        onUnplugged();
      }
    } else if (!plugged) {
      // Nakabitin na plug, bahagyang umuugoy
      plug.rotation.z = UNPLUGGED_ROT.z + Math.sin(t / 450) * 0.12;
    }

    if (powerOn) {
      var s = (t - poweredAt) / 1000;
      var ramp = Math.min(s / 1.2, 1);
      var flick = s < 0.8 ? (Math.sin(s * 70) > -0.3 ? 1 : 0.35) : 1; // kisap-kisap pag bukas
      level = ramp * flick;
      spin = SPIN_SPEED * ease(Math.min(s / 2, 1));
    } else {
      level = Math.max(0, level - dt * 2.5);   // mabilis na dumidilim
      spin *= Math.exp(-dt * 1.8);             // dahan-dahang bumabagal ang ikot
      if (spin < 0.002) spin = 0;
    }
    applyPower(level);
    inner.rotation.y += dt * spin;

    cx += (tx - cx) * 0.06;
    cy += (ty - cy) * 0.06;

    // Intro: lumalaki at umiikot papasok
    var p = Math.min((t - born) / 1400, 1);
    var e = 1 - Math.pow(1 - p, 3);
    pole.scale.setScalar(0.8 + 0.2 * e);
    pole.rotation.y = cx * 0.5 + (1 - e) * Math.PI * 1.5;
    pole.rotation.x = cy * 0.15;
    pole.position.y = Math.sin(t / 900) * 0.08;

    renderer.render(scene, camera);
    raf = window.requestAnimationFrame(frame);
  }
  raf = window.requestAnimationFrame(frame);

  /* ---------- Enter ---------- */
  var leaving = false;
  function enter() {
    if (leaving) return;
    leaving = true;
    markSeen();
    root.classList.add("is-leaving");
    document.body.classList.remove("is-locked");
    window.setTimeout(function () {
      running = false;
      window.cancelAnimationFrame(raf);
      tex.dispose();
      glowTex.dispose();
      renderer.dispose();
      removeNow();
    }, 950);
  }

  enterBtn.addEventListener("click", enter);
  document.addEventListener("keydown", function (e) {
    if (!leaving && e.key === "Escape") enter(); // Esc = skip
  });
  try { hint.focus({ preventScroll: true }); } catch (err) {}
})();
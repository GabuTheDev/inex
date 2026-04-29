import "../../css/views/home.css";
import * as UnicornStudio from '../external/unicornStudio.umd.js'
import lottie from "lottie-web";

var sceneConfig = {
    elementId: "unicorn",
    fps: 40,
    scale: window.innerWidth < 600 ? 0.5 : 0.6,
    dpi: 1.5,
    filePath: "/public/inex.json",
    fixed: true
};

let activeUnicornScene = null;

UnicornStudio.addScene(sceneConfig)
    .then((scene) => {
        activeUnicornScene = scene;
        document.body.classList.add("loaded");
    })
    .catch((err) => {
        console.error(err);
        document.body.classList.add("loaded");
    });

function remeasureUnicornCanvasToViewport() {
    if (!activeUnicornScene?.resize) return;

    const unicornContainer = document.getElementById("unicorn");
    if (unicornContainer) {
        unicornContainer.style.width = window.innerWidth + "px";
        unicornContainer.style.height = window.innerHeight + "px";
    }
    try {
        activeUnicornScene.resize();
    } catch (err) {
        console.error("[unicorn] resize failed", err);
    }
    if (unicornContainer) {
        unicornContainer.style.width = "";
        unicornContainer.style.height = "";
    }
}

function scheduleUnicornRemeasureAcrossFrames() {
    requestAnimationFrame(remeasureUnicornCanvasToViewport);
    requestAnimationFrame(() => requestAnimationFrame(remeasureUnicornCanvasToViewport));
    setTimeout(remeasureUnicornCanvasToViewport, 200);
}

window.addEventListener("focus", scheduleUnicornRemeasureAcrossFrames);
document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") scheduleUnicornRemeasureAcrossFrames();
});
window.addEventListener("pageshow", scheduleUnicornRemeasureAcrossFrames);

const unicornContainer = document.getElementById("unicorn");
if (unicornContainer && typeof ResizeObserver !== "undefined") {
    new ResizeObserver(remeasureUnicornCanvasToViewport).observe(unicornContainer);
}

const logoAnimation = lottie.loadAnimation({
    container: document.getElementById("logo-anim"),
    renderer: "svg",
    autoplay: false,
    loop: false,
    path: "/public/osekai-lottie.json",
});

logoAnimation.addEventListener("config_ready", () => {
    logoAnimation.setSpeed(0.8);
    logoAnimation.play();
    document.getElementById("home-welcome").classList.add("lottie-running");
    setTimeout(() => {
        document.getElementById("home-welcome").classList.add("lottie-done");
    }, 700);
    setTimeout(() => {
        document.getElementById("home-welcome").classList.add("lottie-doner");
    }, 2100);
});
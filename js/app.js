import "./game.js";

document.querySelectorAll("[data-scroll-play]").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelector("#play").scrollIntoView({ behavior: "smooth" });
  });
});

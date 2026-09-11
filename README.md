# Neon Arcade — ACM SIGGRAPH Web Game Portal

A responsive game hub built from scratch for the Web Game Portal task.

## Included requirements

- Game Hub landing page with thumbnail-style game previews and descriptions
- Functioning HTML Canvas game: **Meteor Dodge**
- Keyboard and touch controls
- Responsive layout for mobile and desktop
- External CSS and modular JavaScript
- Performance-conscious animation loop and bounded arrays
- CSS micro-interactions and ambient motion
- Local browser leaderboard using `localStorage`
- GitHub Pages deployment workflow

## Tech stack

- HTML5
- CSS3
- Vanilla JavaScript (ES Modules)
- HTML Canvas API
- GitHub Pages / GitHub Actions

## Run locally

Because JavaScript modules are used, serve the folder through a local HTTP server instead of opening `index.html` directly.

### Python

```bash
python3 -m http.server 8000
```

Then open:

`http://localhost:8000`

### VS Code

Install the **Live Server** extension, right-click `index.html`, and choose **Open with Live Server**.

## Deploy with GitHub Pages

1. Create a public repository named `web-game-portal-siggraph-task`.
2. Push this project to the `main` branch.
3. Open **Settings → Pages** in the GitHub repository.
4. Under **Build and deployment**, choose **GitHub Actions**.
5. The included workflow publishes the site.
6. Your live URL will be similar to:
   `https://YOUR-USERNAME.github.io/web-game-portal-siggraph-task/`

## Evaluation mapping

| Rubric | Implementation |
|---|---|
| Technical Execution — 25 | Interactive Canvas game, collision detection, input, animation |
| Code Quality — 25 | Semantic HTML, external CSS, ES module JS |
| UI/UX — 20 | Cohesive dark/neon visual system, spacing, typography, states |
| Responsiveness — 15 | Mobile breakpoints, fluid sizing, touch controls |
| Bonus — 15 | GitHub Pages workflow, motion, local leaderboard |

## Important

This implementation is intentionally built from scratch rather than copied from a complete template. Understand the code before submitting it.

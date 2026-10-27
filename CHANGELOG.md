# Cambios

Formato basado en [SemVer](https://semver.org/lang/es/). Versión actual: **0.1.4**

## 0.1.4 — 2026-10-26

Redes sociales del inicio.

- Los iconos del hero ahora son enlaces reales que abren en pestaña nueva:
  - Facebook → `https://www.facebook.com/icatedraldefe/`
  - Instagram → `https://www.instagram.com/icatedraldefe/`
  - YouTube → `https://www.youtube.com/@CatedraldeFeCDF`
- Iconos sustituidos por los trazos oficiales de cada marca, para que el dibujo coincida con su nombre (el de Instagram estaba deformado).
- `aria-label` por red, `rel="noopener noreferrer"` y estado de foco visible.
- Efecto al pasar el cursor y soporte de `prefers-reduced-motion`.
- La línea bajo los iconos pasa de `@icatedraldefe` a "Síguenos", porque YouTube usa otro identificador (`@CatedraldeFeCDF`).

## 0.1.3 — 2026-10-26

Publicación del sitio y metadatos para compartir.

- Metadatos sociales con URL absoluta: `canonical`, `og:url`, `og:site_name`, `og:locale`, `og:image:*`.
- Portada social `assets/og-cover.png` (1200×630) con logo, paleta y texto del hero; sustituye al logo cuadrado en las previsualizaciones.
- Etiquetas `twitter:*` completas (título, descripción e imagen).
- `robots.txt` con referencia al sitemap.
- `sitemap.xml` con la URL canónica.
- `404.html` propia, con la identidad del sitio y enlace de vuelta al inicio.
- `.nojekyll` para que GitHub Pages sirva los archivos sin procesarlos con Jekyll.
- Versión visible en el pie (`v0.1.3`) y metadato `<meta name="version">`.

## 0.1.2 — 2026-10-26

- Botón "Compartir esta página" centrado, con efecto futurista.
- Código QR del modal con el logo al centro.

## 0.1.1 — 2026-10-26

- Sitio "Conoce a Dios" de Catedral de Fe: hero, camino de 7 pasos, oración, horarios, comunidad y modal de compartir.

## 0.1.0 — 2026-10-26

- Versión inicial del proyecto.

# Site „3010” — pentru ea ✦

Site static, optimizat **telefon + desktop**. ~**65 poze** + **5 video** (70 media).

## Pe telefon

- Bară jos: Acasă · Galerie · **✧ Surpriză** (poză random) · Mesaj · Efecte
- Meniu **☰** sus
- Galerie: scroll, **film orizontal**, filtre Poze / Video / ★ Favorite
- Lightbox: **swipe** stânga/dreapta între poze
- Atingeri cu efect ripple; video-urile pornesc când intră pe ecran

## Adaugă pozele (cât timp le pui tu)

### Varianta rapidă (recomandat până termini)

Redenumește fișierele în folderul `images/`:

- Poze: `p001.jpg`, `p002.jpg`, … `p065.jpg` (merge și `.png`, `.webp` — schimbă extensia în `photos.js` dacă e cazul)
- Video: `v001.mp4`, … `v005.mp4` (opțional poster: `v001-poster.jpg`)

Site-ul le citește automat (`useAutoSlots: true` în `photos.js`).

### Varianta cu nume libere

Când **termini** toate pozele, spune-mi — actualizez `photos.js` cu numele reale ale fișierelor.

Sau pune manual lista în `photos`:

```javascript
useAutoSlots: false,
photos: [
  { id: "a1", type: "image", src: "images/numele-tau.jpg", style: "neon", alt: "..." },
  { id: "v1", type: "video", src: "images/clip.mp4", poster: "images/clip-cover.jpg", style: "hologram" },
],
```

## Performanță (multe poze)

- Se încarcă **12 pe telefon / 18 pe desktop** per click pe „Mai multe amintiri”
- Lazy loading pe imagini
- Stele mai puține pe mobil (baterie)

## Deschidere

Dublu-click pe `index.html` sau urcă folderul pe [Netlify Drop](https://app.netlify.com/drop) pentru link pe telefon.

## Stiluri poză

`neon`, `hologram`, `polaroid`, `glitch`, `prism`, `vintage`, `chrome`, `aurora`, `cyber` — se rotesc automat la auto-slots.

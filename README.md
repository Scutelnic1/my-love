# Site „3010” — pentru ea ✦

Site static, optimizat pentru telefon și desktop, cu **71 de fotografii**.

## Pe telefon

- Bară jos: Acasă · Galerie · **✧ Surpriză** (poză random) · Mesaj · Efecte
- Meniu **☰** sus
- Galerie: **film orizontal**, filtre Toate / Poze / ★ Favorite
- Lightbox: **swipe** stânga/dreapta între poze
- Atingeri cu efect ripple și animații adaptate la preferința de mișcare

## Adaugă fotografii

### Varianta rapidă (recomandat până termini)

Pune fotografiile în `images/` și adaugă fiecare fișier în lista `photos` din `photos.js`:

```javascript
useAutoSlots: false,
photos: [
  { id: "a1", type: "image", src: "images/numele-tau.jpg", style: "neon", alt: "..." },
],
```

## Performanță (multe poze)

- Se încarcă **12 pe telefon / 18 pe desktop** per click pe „Mai multe amintiri”
- Lazy loading pe imagini
- Stele mai puține pe mobil (baterie)

## Deschidere

Dublu-click pe `index.html` sau urcă folderul pe [Netlify Drop](https://app.netlify.com/drop) pentru link pe telefon.

Pe iPhone, deschide linkul publicat în Safari, apasă **Partajare** și alege **Adaugă la ecranul principal**. Deschiderea din iconița salvată folosește modul standalone, fără bara browserului peste site.

## Stiluri poză

`neon`, `hologram`, `polaroid`, `glitch`, `prism`, `vintage`, `chrome`, `aurora`, `cyber` — se rotesc automat la auto-slots.

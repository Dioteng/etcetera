# Pink Date Invitation (static template)

This is a small, static, pink-themed invitation website template. It's intentionally minimal so you can customize the text and styling quickly.

Files added
- `index.html` — main page with RSVP modal and two CTA buttons
- `css/styles.css` — styles (responsive, pink palette)
- `js/script.js` — client-side interactions (modal, localStorage RSVP, heart burst)
- `assets/heart.svg` — decorative SVG used in the header

How to use

- Open `index.html` in your browser to preview.
- To run a tiny local server (recommended for consistent relative paths):

```bash
# from project root
python -m http.server 8000
# then open http://localhost:8000
```

Customization notes
- Edit the placeholder text in `index.html` for date/time/place.
- Modify colors in `css/styles.css` under `:root` to change the palette.
- The RSVP form stores entries in localStorage under the key `rsvps` as an array. It's local-only; no network calls.

Accessibility & small features
- Modal uses `aria-hidden` and `role=dialog`.
- 'No' button dodges the cursor for a playful touch. Remove that behavior in `js/script.js` if you prefer.

If you want additional pages (gallery, directions, printable card), tell me which pages you want and I'll add them.
# etcetera

## Firebase (optional)

If you'd like RSVPs to be collected centrally, you can enable Firebase Firestore.

1. Create a Firebase project at https://console.firebase.google.com
2. Add a Web App and copy the config values from Project Settings → Your apps.
3. Create a file `assets/firebase-config.js` with the following shape:

```js
window.FIREBASE_CONFIG = {
	apiKey: "...",
	authDomain: "...",
	projectId: "...",
	storageBucket: "...",
	messagingSenderId: "...",
	appId: "..."
};
```

4. The site already includes the Firebase SDK and will initialize Firestore automatically when that file is present. RSVPs submitted from the modal will be written to the `rsvps` collection. If Firestore is not configured, RSVPs fall back to `localStorage`.


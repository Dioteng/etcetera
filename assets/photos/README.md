Photos directory

Drop image files into the date folders below and list their filenames (relative to the folder) in the corresponding manifest.json. Example:

- `assets/photos/30/manifest.json` -> ["img1.jpg","img2.jpg"]
- `assets/photos/31/manifest.json` -> ["dinner.jpg","lights.jpg"]

Supported image file types: .jpg, .jpeg, .png, .webp

When you add images and update the manifest, the gallery components on `date-30.html` and `date-31.html` will render them automatically.

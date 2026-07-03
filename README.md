# Tabguard

Tabguard is a small monorepo with two apps:

- `website`: a static product site that explains the Chrome extension.
- `extention`: the Chrome extension source. The folder name follows the requested spelling.

## Run the website

```sh
npm run dev
```

Then open the local URL printed by Python's static file server.

## Load the Chrome extension

1. Open `chrome://extensions`.
2. Turn on Developer mode.
3. Choose Load unpacked.
4. Select the `extention` folder from the repo.

## Use Tabguard

1. Open any normal website tab.
2. Click the Tabguard extension icon.
3. Choose `Protect this tab`.
4. Interact with the page at least once, then try closing, reloading, or navigating away.

Chrome controls the confirmation dialog text. Tabguard can request the browser's built-in close confirmation, but it cannot customize that dialog.

# Jiwar (رفادة) — Master Prototype

Interactive prototype of the Jiwar resident app (phases 1–4), restored from the
published artifact "Jiwar Master Prototype Build Spec".

| File | Role |
|---|---|
| `Jiwar App.dc.html` | Master page: phone mode + screen gallery |
| `Jiwar Phone.dc.html` | The resident phone app (all screens, state, data) |
| `support.js` | dc runtime (loads React/Babel from unpkg) |
| `ios-frame.jsx`, `image-slot.js` | iPhone frame and image drop slot |

## Run locally

Pages load each other with `fetch`, so serve over HTTP (not `file://`):

```bash
cd jiwar && python3 -m http.server 8000
# open http://localhost:8000/
```

Not included in the original bundle: `Jiwar Provider.dc.html` and
`Jiwar Admin.dc.html` (linked from the toolbar).

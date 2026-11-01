# Third-party notices

## PDF.js

The local PDF reader includes Mozilla PDF.js **5.6.205**, build `ada343803`,
from the `pdfjs-dist` distribution. Copyright Mozilla Foundation and contributors.
PDF.js is licensed under the Apache License, Version 2.0. The complete license
is included at `vendor/pdfjs/LICENSE`.

The `TextLayer` positioning rules in `reader.css` are adapted from PDF.js
`web/pdf_viewer.css`, under the same Apache-2.0 license. The JavaScript bundles
retain their upstream copyright and license notices.

Upstream project: <https://github.com/mozilla/pdf.js>

### Bundled PDF resources

The reader serves all PDF.js resources locally. Their original license notices
are retained alongside the resources:

- Adobe CMaps: `vendor/pdfjs/cmaps/LICENSE`.
- Foxit standard fonts: `vendor/pdfjs/standard_fonts/LICENSE_FOXIT`.
- Liberation Sans standard fonts: `vendor/pdfjs/standard_fonts/LICENSE_LIBERATION`.
- JBIG2 decoder: `vendor/pdfjs/wasm/LICENSE_JBIG2` and `LICENSE_PDFJS_JBIG2`.
- OpenJPEG decoder: `vendor/pdfjs/wasm/LICENSE_OPENJPEG` and `LICENSE_PDFJS_OPENJPEG`.
- QCMS color management: `vendor/pdfjs/wasm/LICENSE_QCMS` and `LICENSE_PDFJS_QCMS`.
- ICC profile: `vendor/pdfjs/iccs/LICENSE`.

## Paper

`assets/paper.pdf` is the author-provided S-CAD manuscript. Its inclusion does
not imply that the paper is licensed under PDF.js’s Apache-2.0 license.

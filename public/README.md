# Additional configuration for handling FFmpeg.wasm COEP issues

This directory contains static files that need proper CORS headers.

For production deployment, ensure your web server is configured to serve these files with:
- Cross-Origin-Resource-Policy: cross-origin
- Or remove COEP headers entirely if SharedArrayBuffer is not strictly required

The current development setup has been configured to work without strict COEP requirements.

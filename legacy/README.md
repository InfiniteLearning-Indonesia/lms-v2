# Legacy frontend archive

The former `/dashboard` and `/ui` route trees are retained here as source
reference while branch `fe-v3` builds the replacement under `/app`. They are
excluded from the v3 build, lint gate, and client bundle; no legacy API or
browser token fallback is reachable from the new runtime.

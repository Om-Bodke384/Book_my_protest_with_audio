# Background music

Drop your own audio file here as `bgm.mp3` (mp3 keeps browser support widest;
`.ogg` also works). It's referenced by `BGM_SRC` in
`frontend/src/hooks/useBackgroundMusic.ts`.

Only use a track you own the rights to, have a proper license for, or that's
genuinely royalty-free/Creative-Commons-licensed for commercial use — this
folder gets deployed publicly along with the rest of the site.

If the file is large, consider hosting it on Cloudinary/a CDN instead and
pointing `BGM_SRC` at that URL, so it doesn't bloat your git repo or slow
down deploys.

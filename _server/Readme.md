
## Gitlab API "endpoint" server

This is used to forward contact requests submitted through pricing pages contact forms to the Gitlab API to create issues for each new lead


### Config

Copy `config.example.js` to `config.js` and add relevant data: Gitlab token, instance URL, etc


### Usage

from the repo root

```
node _serve/server.js
```

and also `npm run dev` so that changes to the 11ty site are build on each save

then access the site at `localhost:3004` instead of the `:8080` served by 11ty
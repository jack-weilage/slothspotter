# `slothspotter.com`

SlothSpotter is a **free, open-source, and community-driven** platform for tracking and reporting
stuffed sloths all around Bellingham.

## Features

**OAuth2 login** - Anybody (with an applicable social account) can login without making a new
account, while still providing only minimal information. We collect a user ID, a name, an avatar,
and nothing else!

**Image attachments** - Upload and view photos attached to sightings for a more engaging experience.

**Safety and moderation** - Users can report user-submitted content to help keep SlothSpotter fun,
safe, and welcoming for everyone.

## Deployment

### Tech Stack

- [SvelteKit](https://svelte.dev) is used for the API and webpages.
- [MapLibre](https://maplibre.org/) and [Carto](https://carto.com) are used for mapping
  functionality.
- [Cloudflare Workers](https://workers.cloudflare.com/) hosts the website and KV store
- [Cloudflare D1](https://developers.cloudflare.com/d1/) is used as the main database, storing user,
  sloth, and sighting data in a fast, reliable SQL database.
- [Cloudflare Images](https://developers.cloudflare.com/images/) is used to store and serve
  user-uploaded images, providing a scalable and efficient solution for media management.

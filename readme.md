
Repository for the CryptPad project website

## Usage

1. fetch dependencies: `npm i`
2. build the site from source: `npm run build`
3. for development use `npm run dev` to serve the `built/` directory and refresh the browser automatically

## Special features

### Testimonials

- Data is formatted for input from CryptPad Form JSON
- Anonimize data according to consent expressed (esp. for the data that is committed to this repo)
  - remove organization if Q6 is NO (leave general sector if available)
  - always remove the email in Q7 

- to add a testimonial to a sector page (Education, Nonprofit, Enterprise)
  - add `"sector": "Nonprofit"` to the entry

### Optimizing images

Images currently have the most significant impact on loading time.

Ubuntu's repos contain two tools that make lossless image compression very simple:

```bash
apt install jpegoptim optipng
```

With these installed you can run `npm run optimize` to minimize the size of all images in `static/images/` without any loss of quality.


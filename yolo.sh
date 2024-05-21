ssh cryptpad@agile.cryptpad.fr "cd /home/cryptpad/cryptpad.org && git pull origin main && npm run clean && npx @11ty/eleventy --input=. --output=built"

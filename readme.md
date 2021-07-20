## Usage

You need some very basic node dependencies:

`npm i`

then build it:

`node build.js`

and serve `cryptpad.org/built/` with your preferred static webserver.

## Ideas

* cryptpad.org architecture
  * rebuild from latest data once per day
  * serve as static html
* static sales pages for SEO
  * enterprise
  * education
* public directory
  * built from the account server's telemetry logs
* more ephemeral instance
  * our second instance in the public directory
  * short-lived content, no registration, customized UI?
  * for _non-paying users_
    * no support
    * no long-term storage
* accounts
  * stop logging to stdout
  * launch via systemd
  * separate accounts logs from telemetry
  * front-end
    * 1Q survey when unsubscribing
      * and subscribing?
* github
  * issue templates
    * feature request cost money
  * bug reports need details
  * configuration issues => get a support contract
* stats
  * server name
  * server description
  * server url
  * version
  * type
  * stats
    * registered users
    * maxOpenUniqueWebSockets
    * maxOpenWebSockets
    * openPadsSinceLastPing
    * newPadsSinceLastPing

## Why?

* **convert on-prem admins**
* make our expected social contract clear
  * don't ask anything of us if you aren't helping us
  * the _help_ we most urgetly need is **money**
* make it clear that your money is better spent on us than on an in-house project
* demonstrate the variety of use-cases CryptPad can serve
* derive some value from the existing network of third-party instances
* educate admins about what they can do to actually help us
  * feature requests are not as useful as they seem to think
* make free-riders someone else's problem
  * but why would they go elsewhere
    * paying features on cryptpad.fr that are free elsewhere?
* **demonstrate the magnitude of what we're doing**
* help admins feel good about server telemetry
* let potential users decide between _volunteers_ and _professionals_
  * implying that **professionals deserve fair compensation**
* **org** has better recognition than **.fr** and makes it clear that we're a global project
* it's good to have a static site because:
  * we can optimize it to load super quickly so people can get information about the project faster
  * it will end up in search results
  * people that block js can still get information
  

getting the most out of cryptpad

1. register
2. add contacts
3. organize your drive
4. subscribe
  


## Next steps/Questions

* how does this strategy fit our goal to offload non-paying users/freeloaders
  * why wouldn't they keep freeloading off of us?
* what separate use-cases can we offer for a showcase instance
* how do we call this site? -> will help differentiate what goes on cryptpad.fr and cryptpad.org .net



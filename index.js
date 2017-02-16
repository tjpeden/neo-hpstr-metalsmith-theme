'use strict';

const Metalsmith         = require('metalsmith');
const prism              = require('metalsmith-prism');
const drafts             = require('metalsmith-drafts');
const assets             = require('metalsmith-assets');
const layouts            = require('metalsmith-layouts');
const inPlace            = require('metalsmith-in-place');
const paginate           = require('metalsmith-paginate');
const gravatar           = require('metalsmith-gravatar');
const excerpts           = require('metalsmith-excerpts');
const redirect           = require('metalsmith-redirect');
const permalinks         = require('metalsmith-permalinks');
const collections        = require('metalsmith-collections');
const discoverHelpers    = require('metalsmith-discover-helpers');
const discoverPartials   = require('metalsmith-discover-partials');
const markdownRemarkable = require('metalsmith-markdown-remarkable');

const remarkableEmoji    = require('remarkable-emoji');
const remarkableMentions = require('remarkable-mentions');

Metalsmith(__dirname)
.metadata({
  site: {
    // Site Info
    title: "Blog Title",
    description: "Describe your website here.",
    url: process.env.NODE_ENV === 'production' ? "http://peden.software/neo-hpstr-metalsmith-theme" : 'http://localhost:8080',

    reading_time: true,
    words_per_minute: 200,

    disqus: 'peden-software',
    google_analytics: 'UA-85015540-1',

    // Site Locale Info
    timezone: 'America/Chicago',
    locale: 'en_US',

    // Site Menu
    menu: [{
      title: 'Install',
      url: 'https://github.com/tjpeden/neo-hpstr-metalsmith-theme#installation',
    }, {
      title: 'Fork',
      url: 'https://github.com/tjpeden/neo-hpstr-metalsmith-theme',
    }, {
      title: 'Home',
      url: '/',
    }],

    // Generator Info
    generator: {
      name: 'Matalsmith',
      url: "http://www.metalsmith.io/",
    },

    // Theme Info
    theme: {
      name: 'Neo-HPSTR Metalsmith',
      url: "https://github.com/tjpeden/neo-hpstr-metalsmith-theme",
    },

    // Owner Info
    owner: {
      name: "Your name",
      url: "http://peden.software",
      bio: "Your bio goes here. It shouldn't be super long, but a good couple of sentences should suffice.",
      email: "you@email.com",
      twitter: 'tjpeden',
      networks: [{
        name: 'GitHub',
        icon: 'github-alt',
        url: "https://github.com/tjpeden",
      }, {
        name: 'CodePen',
        icon: 'codepen',
        url: "http://codepen.io/tjpeden/",
      }, {
        name: 'Facebook',
        icon: 'facebook-official',
        url: "https://www.facebook.com/tj.peden",
      }, {
        name: 'Twitter',
        icon: 'twitter',
        url: "https://twitter.com/tjpeden",
      }, {
        name: 'LinkedIn',
        icon: 'linkedin',
        url: "https://www.linkedin.com/in/tjpeden",
      }, {
        name: 'YouTube',
        icon: 'youtube-play',
        url: "https://www.youtube.com/TheTJPeden",
      }, {
        name: 'Twitch',
        icon: 'twitch',
        url: "https://www.twitch.tv/tjpeden",
      }],
    },
  },
})
.source('./content')
.destination('./public')
// .clean(true)
.use(drafts())
.use(
  markdownRemarkable('full', {
    html: true,
    linkify: true,
    typographer: true,
  })
  .use(remarkableEmoji)
  .use(remarkableMentions())
)
.use(prism({
  lineNumbers: true,
}))
.use(excerpts())
.use(collections())
.use(gravatar({
  owner: "you@email.com",
}))
.use(permalinks({
  pattern: ':title',
  linksets: [
    {
      match: { collection: 'posts' },
      pattern: ':date/:title',
    },
  ],
}))
.use(paginate({
  path: 'page',
}))
.use((files, metalsmith, done) => {
  Object.keys(files).forEach(name => {
    let data = files[name];

    data.path = name;
  });

  done();
})
// .use((files, metalsmith, done) => {
//   setImmediate(done);
//   console.dir(files);
// })
.use(discoverHelpers())
.use(discoverPartials())
.use(inPlace({
  engine: 'handlebars',
}))
.use(layouts({
  engine: 'handlebars',
  default: 'page.html',
}))
// .use(redirect({
//   '/old/path': '/new/path',
// }))
.use(assets({
  source: './assets',
}))
.build((error, files) => { if(error) { throw error; } });

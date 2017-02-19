'use strict';

const Metalsmith         = require('metalsmith');
const lunr               = require('metalsmith-lunr');
const prism              = require('metalsmith-prism');
const drafts             = require('metalsmith-drafts');
const assets             = require('metalsmith-assets');
const inspect            = require('metalsmith-inspect');
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

const striptags          = require('striptags');

const {TfIdf}            = require('natural');

function relations(options) {
  options = Object.assign({
    terms: 5,
    max: 5,
    threshold: 0,
    text: document => String(document.contents)
  }, options);

  if(options.match == null) {
    throw new Error("Expected match criteria on which to filter.");
  }

  function matchDocument(file) {
    const {match} = options;

    return Object.keys(match).every(key => {
      if(file[key] === match[key]) { return true }
      if(file[key] && file[key].indexOf) {
        return file[key].indexOf(match[key]) > -1;
      }

      return false;
    });
  }

  return (files, metalsmith, done) => {
    const tfidf = new TfIdf();
    const keys = Object.keys(files).filter(key => matchDocument(files[key]));

    keys.forEach(key => tfidf.addDocument(options.text(files[key]), key));

    keys.forEach((key, index) => {
      const document = files[key];
      const keyTerms = tfidf.listTerms(index)
      .slice(0, options.terms)
      .map(({term}) => term);

      document.relations = keys.reduce((relations, key, d) => {
        if(d !== index) {
          const frequency = tfidf.tfidf(keyTerms, d);

          if(frequency > options.threshold) {
            relations.push({key, frequency});
          }
        }

        return relations;
      }, [])
      .sort((a, b) => a.frequency - b.frequency)
      .slice(0, options.max)
      .map(({key}) => files[key]);
    });

    done();
  };
}

console.log('ENV:', process.env.NODE_ENV || 'development');

Metalsmith(__dirname)
.metadata({
  site: {
    // Site Info
    title: "Blog Title",
    description: "Describe your website here.",
    url: process.env.NODE_ENV === 'production' ? "http://peden.software/neo-hpstr-metalsmith-theme" : 'http://localhost:8080',

    reading_time: true,
    words_per_minute: 200,

    disqus: '',
    google_analytics: '',

    // Site Locale Info
    timezone: 'America/Chicago',
    locale: 'en_US',

    // Site Menu
    menu: [{
      title: 'GitHub',
      url: '#',
      submenu: [{
        title: 'Install',
        url: "https://github.com/tjpeden/neo-hpstr-metalsmith-theme#installation",
      }, {
        title: 'Fork',
        url: "https://github.com/tjpeden/neo-hpstr-metalsmith-theme",
      }]
    }, {
      title: 'About',
      url: '/about',
    }, {
      title: 'Archive',
      url: '/posts',
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
      name: 'Neo-HPSTR Metalsmith Theme',
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
.use(inspect({
  disable: true,
  includeMetalsmith: true,
  exclude: ['contents',  'excerpt', 'stats', 'next', 'previous'],
}))
.source('./content')
.destination('./public')
.clean(true)
.use(drafts())
.use(collections({
  posts: {
    sortBy: 'date',
    reverse: true,
  }
}))
.use(relations({
  max: 3,
  match: {
    collection: 'posts',
  }
}))
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
.use(discoverHelpers())
.use(discoverPartials())
.use(inPlace())
.use(layouts({
  engine: 'handlebars',
  default: 'page.html',
}))
.use(lunr({
  ref: 'path',
  indexPath: 'search/index.json',
  fields: {
    title: 5,
    contents: 1,
    tags: 10,
  },
  preprocess: striptags
}))
// .use(redirect({
//   '/old/path': '/new/path',
// }))
.use(assets({
  source: './assets',
}))
.build((error, files) => {
  if(error) {
    throw error;
  }
});

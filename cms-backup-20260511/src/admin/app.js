import logo from './extensions/logo.png';
import favicon from './extensions/favicon.ico';

export default {
  config: {
    locales: ['en', 'hi'],
    auth: {
      logo: logo,
    },
    head: {
      favicon: favicon,
    },
    menu: {
      logo: logo,
    },
    theme: {
      light: {
        colors: {
          primary100: '#fff7ed',
          primary200: '#ffedd5',
          primary500: '#f97316',
          primary600: '#ea580c',
          primary700: '#c2410c',
        },
      },
      dark: {
        colors: {
          primary100: '#7c2d12',
          primary200: '#9a3412',
          primary500: '#f97316',
          primary600: '#fb923c',
          primary700: '#fdba74',
        },
      },
    },
    translations: {
      en: {
        'app.components.LeftMenu.navbrand.title': 'Raushni CMS',
        'app.components.LeftMenu.navbrand.workplace': 'NGO Management',
      },
      hi: {
        'app.components.LeftMenu.navbrand.title': 'रौशनी सीएमएस',
        'app.components.LeftMenu.navbrand.workplace': 'एनजीओ प्रबंधन',
      },
    },
    notifications: { release: false },
  },
  bootstrap(app) {
    console.log('Raushni CMS initialized');
  },
};
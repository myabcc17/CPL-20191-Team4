export default {

  // home is a section without childs, set as an empty array
  home: [],

  products: [

    {
      type: 'title',
      txt: 'Products',
      icon: 'fa fa-tag context-menu__title-icon',
    },

    {
      type: 'link',
      txt: 'List Products',
      link: '/page',
    },

    {
      type: 'link',
      txt: 'Add New Product',
      link: '/page',
    },

    {
      type: 'link',
      txt: 'Manage Categories',
      link: '/page',
    },

  ],

  customers: [

    {
      type: 'title',
      txt: 'Customers',
      icon: 'fa fa-users context-menu__title-icon',
    },

    {
      type: 'link',
      txt: 'List Customers',
      link: '/page',
    },

    {
      type: 'link',
      txt: 'List Contacts',
      link: '/page',
    },

    {
      type: 'link',
      txt: 'List Newsletters',
      link: '/page',
    },

  ],

};

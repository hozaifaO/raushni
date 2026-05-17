import type { Schema, Attribute } from '@strapi/strapi';

export interface MediaImage extends Schema.Component {
  collectionName: 'components_media_images';
  info: {
    displayName: 'Image';
    icon: 'picture';
    description: 'Reusable image with caption and alternative text';
  };
  attributes: {
    image: Attribute.Media & Attribute.Required;
    alternativeText: Attribute.String;
    caption: Attribute.String;
  };
}

export interface SharedRichText extends Schema.Component {
  collectionName: 'components_shared_rich_texts';
  info: {
    displayName: 'Rich Text';
    icon: 'align-left';
    description: 'Reusable rich text content block';
  };
  attributes: {
    body: Attribute.RichText & Attribute.Required;
  };
}

export interface SharedSeo extends Schema.Component {
  collectionName: 'components_shared_seos';
  info: {
    displayName: 'Seo';
    icon: 'search';
    description: 'SEO metadata';
  };
  attributes: {
    metaTitle: Attribute.String & Attribute.Required;
    metaDescription: Attribute.Text &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        maxLength: 160;
      }>;
    metaImage: Attribute.Media;
    keywords: Attribute.Text;
    structuredData: Attribute.JSON;
    metaRobots: Attribute.String;
    canonicalURL: Attribute.String;
  };
}

declare module '@strapi/types' {
  export module Shared {
    export interface Components {
      'media.image': MediaImage;
      'shared.rich-text': SharedRichText;
      'shared.seo': SharedSeo;
    }
  }
}

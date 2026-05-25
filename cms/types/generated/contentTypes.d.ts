import type { Schema, Attribute } from '@strapi/strapi';

export interface AdminPermission extends Schema.CollectionType {
  collectionName: 'admin_permissions';
  info: {
    name: 'Permission';
    description: '';
    singularName: 'permission';
    pluralName: 'permissions';
    displayName: 'Permission';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    actionParameters: Attribute.JSON & Attribute.DefaultTo<{}>;
    subject: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    properties: Attribute.JSON & Attribute.DefaultTo<{}>;
    conditions: Attribute.JSON & Attribute.DefaultTo<[]>;
    role: Attribute.Relation<'admin::permission', 'manyToOne', 'admin::role'>;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'admin::permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'admin::permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface AdminUser extends Schema.CollectionType {
  collectionName: 'admin_users';
  info: {
    name: 'User';
    description: '';
    singularName: 'user';
    pluralName: 'users';
    displayName: 'User';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    firstname: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    lastname: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    username: Attribute.String;
    email: Attribute.Email &
      Attribute.Required &
      Attribute.Private &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    password: Attribute.Password &
      Attribute.Private &
      Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    resetPasswordToken: Attribute.String & Attribute.Private;
    registrationToken: Attribute.String & Attribute.Private;
    isActive: Attribute.Boolean &
      Attribute.Private &
      Attribute.DefaultTo<false>;
    roles: Attribute.Relation<'admin::user', 'manyToMany', 'admin::role'> &
      Attribute.Private;
    blocked: Attribute.Boolean & Attribute.Private & Attribute.DefaultTo<false>;
    preferedLanguage: Attribute.String;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<'admin::user', 'oneToOne', 'admin::user'> &
      Attribute.Private;
    updatedBy: Attribute.Relation<'admin::user', 'oneToOne', 'admin::user'> &
      Attribute.Private;
  };
}

export interface AdminRole extends Schema.CollectionType {
  collectionName: 'admin_roles';
  info: {
    name: 'Role';
    description: '';
    singularName: 'role';
    pluralName: 'roles';
    displayName: 'Role';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    name: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    code: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    description: Attribute.String;
    users: Attribute.Relation<'admin::role', 'manyToMany', 'admin::user'>;
    permissions: Attribute.Relation<
      'admin::role',
      'oneToMany',
      'admin::permission'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<'admin::role', 'oneToOne', 'admin::user'> &
      Attribute.Private;
    updatedBy: Attribute.Relation<'admin::role', 'oneToOne', 'admin::user'> &
      Attribute.Private;
  };
}

export interface AdminApiToken extends Schema.CollectionType {
  collectionName: 'strapi_api_tokens';
  info: {
    name: 'Api Token';
    singularName: 'api-token';
    pluralName: 'api-tokens';
    displayName: 'Api Token';
    description: '';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    name: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    description: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }> &
      Attribute.DefaultTo<''>;
    type: Attribute.Enumeration<['read-only', 'full-access', 'custom']> &
      Attribute.Required &
      Attribute.DefaultTo<'read-only'>;
    accessKey: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    lastUsedAt: Attribute.DateTime;
    permissions: Attribute.Relation<
      'admin::api-token',
      'oneToMany',
      'admin::api-token-permission'
    >;
    expiresAt: Attribute.DateTime;
    lifespan: Attribute.BigInteger;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'admin::api-token',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'admin::api-token',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface AdminApiTokenPermission extends Schema.CollectionType {
  collectionName: 'strapi_api_token_permissions';
  info: {
    name: 'API Token Permission';
    description: '';
    singularName: 'api-token-permission';
    pluralName: 'api-token-permissions';
    displayName: 'API Token Permission';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    token: Attribute.Relation<
      'admin::api-token-permission',
      'manyToOne',
      'admin::api-token'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'admin::api-token-permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'admin::api-token-permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface AdminTransferToken extends Schema.CollectionType {
  collectionName: 'strapi_transfer_tokens';
  info: {
    name: 'Transfer Token';
    singularName: 'transfer-token';
    pluralName: 'transfer-tokens';
    displayName: 'Transfer Token';
    description: '';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    name: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    description: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }> &
      Attribute.DefaultTo<''>;
    accessKey: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    lastUsedAt: Attribute.DateTime;
    permissions: Attribute.Relation<
      'admin::transfer-token',
      'oneToMany',
      'admin::transfer-token-permission'
    >;
    expiresAt: Attribute.DateTime;
    lifespan: Attribute.BigInteger;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'admin::transfer-token',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'admin::transfer-token',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface AdminTransferTokenPermission extends Schema.CollectionType {
  collectionName: 'strapi_transfer_token_permissions';
  info: {
    name: 'Transfer Token Permission';
    description: '';
    singularName: 'transfer-token-permission';
    pluralName: 'transfer-token-permissions';
    displayName: 'Transfer Token Permission';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    token: Attribute.Relation<
      'admin::transfer-token-permission',
      'manyToOne',
      'admin::transfer-token'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'admin::transfer-token-permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'admin::transfer-token-permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginUploadFile extends Schema.CollectionType {
  collectionName: 'files';
  info: {
    singularName: 'file';
    pluralName: 'files';
    displayName: 'File';
    description: '';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    name: Attribute.String & Attribute.Required;
    alternativeText: Attribute.String;
    caption: Attribute.String;
    width: Attribute.Integer;
    height: Attribute.Integer;
    formats: Attribute.JSON;
    hash: Attribute.String & Attribute.Required;
    ext: Attribute.String;
    mime: Attribute.String & Attribute.Required;
    size: Attribute.Decimal & Attribute.Required;
    url: Attribute.String & Attribute.Required;
    previewUrl: Attribute.String;
    provider: Attribute.String & Attribute.Required;
    provider_metadata: Attribute.JSON;
    related: Attribute.Relation<'plugin::upload.file', 'morphToMany'>;
    folder: Attribute.Relation<
      'plugin::upload.file',
      'manyToOne',
      'plugin::upload.folder'
    > &
      Attribute.Private;
    folderPath: Attribute.String &
      Attribute.Required &
      Attribute.Private &
      Attribute.SetMinMax<{
        min: 1;
      }>;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::upload.file',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'plugin::upload.file',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginUploadFolder extends Schema.CollectionType {
  collectionName: 'upload_folders';
  info: {
    singularName: 'folder';
    pluralName: 'folders';
    displayName: 'Folder';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    name: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMax<{
        min: 1;
      }>;
    pathId: Attribute.Integer & Attribute.Required & Attribute.Unique;
    parent: Attribute.Relation<
      'plugin::upload.folder',
      'manyToOne',
      'plugin::upload.folder'
    >;
    children: Attribute.Relation<
      'plugin::upload.folder',
      'oneToMany',
      'plugin::upload.folder'
    >;
    files: Attribute.Relation<
      'plugin::upload.folder',
      'oneToMany',
      'plugin::upload.file'
    >;
    path: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMax<{
        min: 1;
      }>;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::upload.folder',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'plugin::upload.folder',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginI18NLocale extends Schema.CollectionType {
  collectionName: 'i18n_locale';
  info: {
    singularName: 'locale';
    pluralName: 'locales';
    collectionName: 'locales';
    displayName: 'Locale';
    description: '';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    name: Attribute.String &
      Attribute.SetMinMax<{
        min: 1;
        max: 50;
      }>;
    code: Attribute.String & Attribute.Unique;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::i18n.locale',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'plugin::i18n.locale',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginUsersPermissionsPermission
  extends Schema.CollectionType {
  collectionName: 'up_permissions';
  info: {
    name: 'permission';
    description: '';
    singularName: 'permission';
    pluralName: 'permissions';
    displayName: 'Permission';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Attribute.String & Attribute.Required;
    role: Attribute.Relation<
      'plugin::users-permissions.permission',
      'manyToOne',
      'plugin::users-permissions.role'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::users-permissions.permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'plugin::users-permissions.permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginUsersPermissionsRole extends Schema.CollectionType {
  collectionName: 'up_roles';
  info: {
    name: 'role';
    description: '';
    singularName: 'role';
    pluralName: 'roles';
    displayName: 'Role';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    name: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 3;
      }>;
    description: Attribute.String;
    type: Attribute.String & Attribute.Unique;
    permissions: Attribute.Relation<
      'plugin::users-permissions.role',
      'oneToMany',
      'plugin::users-permissions.permission'
    >;
    users: Attribute.Relation<
      'plugin::users-permissions.role',
      'oneToMany',
      'plugin::users-permissions.user'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::users-permissions.role',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'plugin::users-permissions.role',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginUsersPermissionsUser extends Schema.CollectionType {
  collectionName: 'up_users';
  info: {
    name: 'user';
    description: '';
    singularName: 'user';
    pluralName: 'users';
    displayName: 'User';
  };
  options: {
    draftAndPublish: false;
    timestamps: true;
  };
  attributes: {
    username: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 3;
      }>;
    email: Attribute.Email &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    provider: Attribute.String;
    password: Attribute.Password &
      Attribute.Private &
      Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    resetPasswordToken: Attribute.String & Attribute.Private;
    confirmationToken: Attribute.String & Attribute.Private;
    confirmed: Attribute.Boolean & Attribute.DefaultTo<false>;
    blocked: Attribute.Boolean & Attribute.DefaultTo<false>;
    role: Attribute.Relation<
      'plugin::users-permissions.user',
      'manyToOne',
      'plugin::users-permissions.role'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiDesignationDesignation extends Schema.CollectionType {
  collectionName: 'designations';
  info: {
    singularName: 'designation';
    pluralName: 'designations';
    displayName: 'Designation';
    description: 'Staff, volunteer, internship, and governance designation content';
  };
  options: {
    draftAndPublish: false;
    populateCreatorFields: true;
  };
  attributes: {
    slug: Attribute.UID<'api::designation.designation', 'title'> &
      Attribute.Required;
    title: Attribute.String & Attribute.Required;
    code: Attribute.String & Attribute.Required & Attribute.Unique;
    department: Attribute.String & Attribute.Required;
    level: Attribute.Enumeration<
      [
        'board',
        'leadership',
        'management',
        'coordination',
        'field',
        'volunteer',
        'intern'
      ]
    > &
      Attribute.Required &
      Attribute.DefaultTo<'volunteer'>;
    status: Attribute.Enumeration<['active', 'inactive', 'archived']> &
      Attribute.Required &
      Attribute.DefaultTo<'active'>;
    reportsTo: Attribute.String;
    description: Attribute.Text & Attribute.Required;
    assignmentScope: Attribute.String & Attribute.Required;
    responsibilities: Attribute.JSON;
    requiredDocuments: Attribute.JSON;
    staffAssigned: Attribute.Integer &
      Attribute.SetMinMax<{
        min: 0;
      }> &
      Attribute.DefaultTo<0>;
    capacity: Attribute.Integer &
      Attribute.SetMinMax<{
        min: 0;
      }> &
      Attribute.DefaultTo<0>;
    sortOrder: Attribute.Integer &
      Attribute.SetMinMax<{
        min: 0;
      }> &
      Attribute.DefaultTo<0>;
    notes: Attribute.Text;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::designation.designation',
      'oneToOne',
      'admin::user'
    >;
    updatedBy: Attribute.Relation<
      'api::designation.designation',
      'oneToOne',
      'admin::user'
    >;
  };
}

export interface ApiDocumentTemplateDocumentTemplate
  extends Schema.CollectionType {
  collectionName: 'document_templates';
  info: {
    singularName: 'document-template';
    pluralName: 'document-templates';
    displayName: 'Document Template';
    description: 'CMS-managed templates and wording for generated documents';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    key: Attribute.UID<'api::document-template.document-template', 'name'> &
      Attribute.Required;
    name: Attribute.String & Attribute.Required;
    category: Attribute.Enumeration<
      [
        'member_id',
        'donation_receipt',
        'certificate',
        'appointment_letter',
        'qr_code'
      ]
    > &
      Attribute.Required;
    description: Attribute.Text;
    title: Attribute.String;
    subtitle: Attribute.String;
    body: Attribute.RichText;
    footer: Attribute.Text;
    legalNote: Attribute.Text;
    thankYouNote: Attribute.String;
    signatoryLabel: Attribute.String;
    logo: Attribute.Media;
    logoUrl: Attribute.String;
    stamp: Attribute.Media;
    stampUrl: Attribute.String;
    accentColor: Attribute.String;
    htmlTemplate: Attribute.Text;
    placeholders: Attribute.JSON;
    settings: Attribute.JSON;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::document-template.document-template',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::document-template.document-template',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiDonationPaymentSettingDonationPaymentSetting
  extends Schema.CollectionType {
  collectionName: 'donation_payment_settings';
  info: {
    singularName: 'donation-payment-setting';
    pluralName: 'donation-payment-settings';
    displayName: 'Donation Payment Setting';
    description: 'CMS-managed donation payment methods, UPI details, and QR code configuration';
  };
  options: {
    draftAndPublish: false;
    populateCreatorFields: true;
  };
  attributes: {
    slug: Attribute.UID<
      'api::donation-payment-setting.donation-payment-setting',
      'title'
    > &
      Attribute.Required;
    title: Attribute.String & Attribute.Required;
    intro: Attribute.Text & Attribute.Required;
    upiId: Attribute.String;
    qrImageUrl: Attribute.String & Attribute.Required;
    accountName: Attribute.String & Attribute.Required;
    paymentOptions: Attribute.JSON & Attribute.Required;
    instructions: Attribute.JSON;
    supportContact: Attribute.String;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::donation-payment-setting.donation-payment-setting',
      'oneToOne',
      'admin::user'
    >;
    updatedBy: Attribute.Relation<
      'api::donation-payment-setting.donation-payment-setting',
      'oneToOne',
      'admin::user'
    >;
  };
}

export interface ApiInternshipAnnouncementInternshipAnnouncement
  extends Schema.CollectionType {
  collectionName: 'internship_announcements';
  info: {
    singularName: 'internship-announcement';
    pluralName: 'internship-announcements';
    displayName: 'Internship Announcement';
    description: 'Public and dashboard-managed internship announcement content';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    title: Attribute.String & Attribute.Required;
    slug: Attribute.UID<
      'api::internship-announcement.internship-announcement',
      'title'
    > &
      Attribute.Required;
    summary: Attribute.Text & Attribute.Required;
    description: Attribute.Text & Attribute.Required;
    startDate: Attribute.Date;
    endDate: Attribute.Date;
    registrationDeadline: Attribute.Date;
    eventDate: Attribute.Date;
    eventTime: Attribute.String;
    location: Attribute.String;
    mode: Attribute.Enumeration<['virtual', 'hybrid', 'in_person']> &
      Attribute.DefaultTo<'virtual'>;
    status: Attribute.Enumeration<['draft', 'published', 'closed']> &
      Attribute.DefaultTo<'published'>;
    poster: Attribute.Media;
    posterUrl: Attribute.String;
    applyUrl: Attribute.String;
    githubUrl: Attribute.String;
    contactPhone: Attribute.String;
    benefits: Attribute.JSON;
    tracks: Attribute.JSON;
    eligibility: Attribute.JSON;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::internship-announcement.internship-announcement',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::internship-announcement.internship-announcement',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiLandingPageLandingPage extends Schema.SingleType {
  collectionName: 'landing_pages';
  info: {
    singularName: 'landing-page';
    pluralName: 'landing-pages';
    displayName: 'Landing Page';
    description: 'Public Raushni landing page content';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    title: Attribute.String &
      Attribute.Required &
      Attribute.DefaultTo<'Raushni Educational & Social Welfare Trust'>;
    heroEyebrow: Attribute.String &
      Attribute.DefaultTo<'Community-led education, healthcare, and dignity'>;
    heroSubtitle: Attribute.Text;
    aboutHeading: Attribute.String &
      Attribute.DefaultTo<'Lighting pathways out of poverty and illiteracy.'>;
    vision: Attribute.Text & Attribute.Required;
    mission: Attribute.Text & Attribute.Required;
    missionHeading: Attribute.String &
      Attribute.DefaultTo<'Sustainable change, one life at a time.'>;
    focusAreas: Attribute.JSON;
    objectives: Attribute.RichText & Attribute.Required;
    successHeading: Attribute.String &
      Attribute.DefaultTo<'Progress shaped by community trust.'>;
    successIntro: Attribute.Text;
    successStories: Attribute.RichText;
    volunteerHeading: Attribute.String &
      Attribute.DefaultTo<'Bring your time, skill, network, or care.'>;
    volunteerIntro: Attribute.Text;
    volunteerWays: Attribute.JSON;
    contactHeading: Attribute.String &
      Attribute.DefaultTo<"Let's build a more equitable community.">;
    contactAddress: Attribute.String;
    contactPhone: Attribute.String;
    contactEmail: Attribute.Email;
    logo: Attribute.Media;
    banner: Attribute.Media;
    heroVideo: Attribute.Media;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::landing-page.landing-page',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::landing-page.landing-page',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiProjectContentProjectContent extends Schema.CollectionType {
  collectionName: 'project_contents';
  info: {
    singularName: 'project-content';
    pluralName: 'project-contents';
    displayName: 'Project Content';
    description: 'CMS-managed project proposals and dashboard project content';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    slug: Attribute.UID<'api::project-content.project-content', 'title'> &
      Attribute.Required;
    title: Attribute.String & Attribute.Required;
    shortTitle: Attribute.String;
    summary: Attribute.Text;
    rationale: Attribute.RichText;
    location: Attribute.String;
    duration: Attribute.String;
    budget: Attribute.String;
    beneficiaries: Attribute.String;
    status: Attribute.Enumeration<
      ['draft', 'proposed', 'approved', 'active', 'completed', 'on_hold']
    > &
      Attribute.DefaultTo<'proposed'>;
    focusArea: Attribute.String;
    coverImage: Attribute.Media;
    coverImageUrl: Attribute.String;
    proposalDocument: Attribute.Media;
    proposalDocumentUrl: Attribute.String;
    objectives: Attribute.JSON;
    activities: Attribute.JSON;
    outcomes: Attribute.JSON;
    sdgs: Attribute.JSON;
    timeline: Attribute.JSON;
    budgetBreakdown: Attribute.JSON;
    team: Attribute.JSON;
    monitoring: Attribute.JSON;
    risks: Attribute.JSON;
    seoTitle: Attribute.String;
    seoDescription: Attribute.Text;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::project-content.project-content',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::project-content.project-content',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiPublicPagePublicPage extends Schema.CollectionType {
  collectionName: 'public_pages';
  info: {
    singularName: 'public-page';
    pluralName: 'public-pages';
    displayName: 'Public Page';
    description: 'CMS-managed content for public website pages';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    slug: Attribute.UID<'api::public-page.public-page', 'title'> &
      Attribute.Required;
    title: Attribute.String & Attribute.Required;
    heroEyebrow: Attribute.String;
    heroTitle: Attribute.String & Attribute.Required;
    heroText: Attribute.Text;
    heroImage: Attribute.Media;
    heroImageUrl: Attribute.String;
    actionLabel: Attribute.String;
    actionHref: Attribute.String;
    sections: Attribute.JSON;
    seoTitle: Attribute.String;
    seoDescription: Attribute.Text;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::public-page.public-page',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::public-page.public-page',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiSiteSettingSiteSetting extends Schema.SingleType {
  collectionName: 'site_settings';
  info: {
    singularName: 'site-setting';
    pluralName: 'site-settings';
    displayName: 'Site Setting';
    description: 'Shared public website navigation, brand, contact, footer, and social content';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    siteName: Attribute.String &
      Attribute.Required &
      Attribute.DefaultTo<'Raushni Educational & Social Welfare Trust'>;
    brandShortName: Attribute.String & Attribute.DefaultTo<'Raushni'>;
    brandTagline: Attribute.String &
      Attribute.DefaultTo<'Educational & Social Welfare Trust'>;
    description: Attribute.Text;
    contactAddress: Attribute.String;
    contactPhone: Attribute.String;
    contactEmail: Attribute.Email;
    logo: Attribute.Media;
    stampLogo: Attribute.Media;
    navItems: Attribute.JSON;
    quickLinks: Attribute.JSON;
    supportLinks: Attribute.JSON;
    socialLinks: Attribute.JSON;
    footerNote: Attribute.Text;
    newsletterTitle: Attribute.String &
      Attribute.DefaultTo<'Stay connected with Raushni'>;
    newsletterText: Attribute.Text;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::site-setting.site-setting',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::site-setting.site-setting',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

declare module '@strapi/types' {
  export module Shared {
    export interface ContentTypes {
      'admin::permission': AdminPermission;
      'admin::user': AdminUser;
      'admin::role': AdminRole;
      'admin::api-token': AdminApiToken;
      'admin::api-token-permission': AdminApiTokenPermission;
      'admin::transfer-token': AdminTransferToken;
      'admin::transfer-token-permission': AdminTransferTokenPermission;
      'plugin::upload.file': PluginUploadFile;
      'plugin::upload.folder': PluginUploadFolder;
      'plugin::i18n.locale': PluginI18NLocale;
      'plugin::users-permissions.permission': PluginUsersPermissionsPermission;
      'plugin::users-permissions.role': PluginUsersPermissionsRole;
      'plugin::users-permissions.user': PluginUsersPermissionsUser;
      'api::designation.designation': ApiDesignationDesignation;
      'api::document-template.document-template': ApiDocumentTemplateDocumentTemplate;
      'api::donation-payment-setting.donation-payment-setting': ApiDonationPaymentSettingDonationPaymentSetting;
      'api::internship-announcement.internship-announcement': ApiInternshipAnnouncementInternshipAnnouncement;
      'api::landing-page.landing-page': ApiLandingPageLandingPage;
      'api::project-content.project-content': ApiProjectContentProjectContent;
      'api::public-page.public-page': ApiPublicPagePublicPage;
      'api::site-setting.site-setting': ApiSiteSettingSiteSetting;
    }
  }
}

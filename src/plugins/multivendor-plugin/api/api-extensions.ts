import gql from "graphql-tag";

export const shopApiExtensions = gql`
  input CreateSellerInput {
    firstName: String!
    lastName: String!
    emailAddress: String!
    password: String!
  }

  input SellerImagesInput {
    file: Upload!
    tags: String
    customFields: String
  }

  input RegisterSellerInput {
    shopName: String!
    seller: CreateSellerInput!
  }

  extend type Mutation {
    registerNewSeller(input: RegisterSellerInput!): Channel
  }

  extend type Mutation {
    uploadSellerImages(input: SellerImagesInput!): String
  }
`;

export const adminApiExtensions = gql`
  extend type Mutation {
    changeApprovedState(value: Boolean!, sellerId: ID!): String
  }
`;

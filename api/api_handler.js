const fs = require('fs');
require('dotenv').config();
const { ApolloServer } = require('apollo-server-express');
const GraphQLDate = require('./graphql_date.js');
const about = require('./about.js');
const contact = require('./contact.js');
const auth = require('./auth.js');

const resolvers = {
  Query: {
    about: about.getMessage,
    user: auth.resolveUser,
    contact: contact.getContact,
    contactList: contact.listContact,
  },
  Mutation: {
    setAboutMessage: about.setMessage,
    contactAdd: contact.addContact,
    contactUpdate: contact.updateContact,
    contactDelete: contact.removeContact,
    contactRestore: contact.restoreContact,
  },
  GraphQLDate,
};
function getContext({ req }) {
  const user = auth.getUser(req);
  return { user };
}

const server = new ApolloServer({
  typeDefs: fs.readFileSync('schema.graphql', 'utf-8'),
  resolvers,
  context: getContext,
  formatError: (error) => {
    console.log(error);
    return error;
  },
  playground: true,
  introspection: true,
});

function installHandler(app) {
  const enableCors = (process.env.ENABLE_CORS || 'true') === 'true';
  console.log('CORS setting:', enableCors);
  let cors;
  if (enableCors) {
    const origin = process.env.UI_SERVER_ORIGIN || 'http://localhost:8000';
    const methods = 'POST';
    cors = { origin, methods, credentials: true };
  } else {
    cors = 'false';
  }
  server.applyMiddleware({ app, path: '/graphql', cors });
}
module.exports = { installHandler };

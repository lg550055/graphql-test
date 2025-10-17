const { ApolloServer, gql } = require('apollo-server');

// Sample in-memory data
let books = [
  { id: '1', title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', year: 1925 },
  { id: '2', title: 'To Kill a Mockingbird', author: 'Harper Lee', year: 1960 },
];

// Define the GraphQL schema
const typeDefs = gql`
  type Book {
    id: ID!
    title: String!
    author: String!
    year: Int!
  }

  type Query {
    books: [Book!]!
    book(id: ID!): Book
  }

  type Mutation {
    addBook(title: String!, author: String!, year: Int!): Book!
    updateBook(id: ID!, title: String, author: String, year: Int): Book
    deleteBook(id: ID!): Boolean!
  }
`;

// Define resolvers
const resolvers = {
  Query: {
    books: () => books,
    book: (_, { id }) => books.find(book => book.id === id),
  },
  Mutation: {
    addBook: (_, { title, author, year }) => {
      const book = { id: String(books.length + 1), title, author, year };
      books.push(book);
      return book;
    },
    updateBook: (_, { id, title, author, year }) => {
      const bookIndex = books.findIndex(book => book.id === id);
      if (bookIndex === -1) return null;
      books[bookIndex] = {
        ...books[bookIndex],
        title: title || books[bookIndex].title,
        author: author || books[bookIndex].author,
        year: year || books[bookIndex].year,
      };
      return books[bookIndex];
    },
    deleteBook: (_, { id }) => {
      const bookIndex = books.findIndex(book => book.id === id);
      if (bookIndex === -1) return false;
      books.splice(bookIndex, 1);
      return true;
    },
  },
};

// Create Apollo Server instance
const server = new ApolloServer({ typeDefs, resolvers });

// Start the server
server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});

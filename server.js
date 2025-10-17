const { ApolloServer, gql } = require('apollo-server');
const mongoose = require('mongoose');

require('dotenv').config();
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bookstore';
const PORT = process.env.PORT || 4000;

// Connect to MongoDB
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define Mongoose schema
const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  year: { type: Number, required: true },
});

const Book = mongoose.model('Book', bookSchema);

// GraphQL schema
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

// Resolvers using MongoDB
const resolvers = {
  Query: {
    books: async () => await Book.find(),
    book: async (_, { id }) => await Book.findById(id),
  },
  Mutation: {
    addBook: async (_, { title, author, year }) => {
      const book = new Book({ title, author, year });
      await book.save();
      return book;
    },
    updateBook: async (_, { id, title, author, year }) => {
      const updates = {};
      if (title) updates.title = title;
      if (author) updates.author = author;
      if (year) updates.year = year;
      const book = await Book.findByIdAndUpdate(id, updates, { new: true });
      return book;
    },
    deleteBook: async (_, { id }) => {
      const result = await Book.findByIdAndDelete(id);
      return !!result;
    },
  },
};

// Create Apollo Server
const server = new ApolloServer({ typeDefs, resolvers });

// Start the server
server.listen({ port: PORT }).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});

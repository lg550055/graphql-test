const { ApolloServer, gql } = require('apollo-server');
const mongoose = require('mongoose');

require('dotenv').config();
const MONGODB_URI = process.env.MONGODB_URI;
const PORT = process.env.PORT || 4000;

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
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
    books: async () => {
      try {
        return await Book.find()
      } catch (error) {
        throw new Error('Failed to fetch books; ' + error.message);
      }
    },
    book: async (_, { id }) => {
      try {
        const book = await Book.findById(id)
        if (!book) throw new Error('Book not found');
        return book;
      } catch (error) {
        throw new Error('Failed to fetch book; ' + error.message);
      }
    },
  },
  Mutation: {
    addBook: async (_, { title, author, year }) => {
      try{
        const book = new Book({ title, author, year });
        await book.save();
        return book;
      } catch (error) {
        throw new Error('Failed to add book; ' + error.message);
      }
    },
    updateBook: async (_, { id, title, author, year }) => {
      try{
        const updates = {};
        if (title) updates.title = title;
        if (author) updates.author = author;
        if (year) updates.year = year;
        const book = await Book.findByIdAndUpdate(id, updates, { new: true });
        return book;
      } catch (error) {
        throw new Error('Failed to update book; ' + error.message);
      }
    },
    deleteBook: async (_, { id }) => {
      try {
        const result = await Book.findByIdAndDelete(id);
        return !!result;
      } catch (error) {
        throw new Error('Failed to delete book; ' + error.message);
      }
    },
  },
};

// Create Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  formatError: (error) => {
    console.error(error); // Log errors for debugging
    return {
      message: error.message,
      code: error.extensions?.code || 'INTERNAL_SERVER_ERROR',
    };
  },
});

// Start the server
server.listen({ port: PORT }).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});

// Graceful shutdown handler
const gracefulShutdown = async (signal) => {
  console.log(`\n${signal} received. Closing server and database connection...`);
  
  try {
    await server.stop();
    console.log('Apollo Server stopped');
    
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
};

// Listen for termination signals
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

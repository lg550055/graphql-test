## graphql-test
Demo, in-memory, graphql app

### Install and run local, in-memory demo
To install, ensure you have `Node.js` and `npm` installed.

Then:

1. Initialize a Node.js project: `npm init -y`
2. Install dependencies: `npm install apollo-server graphql`
3. Run the server: `node server-v0.js`
4. You can then access the GraphQL Playground at http://localhost:4000 to test (see *sample
operations* below).

### Sample operations
```
# Get all books
query {
  books {
    id
    title
    author
    year
  }
}

# Get a single book
query {
  book(id: "1") {
    title
    author
  }
}

# Add a new book
mutation {
  addBook(title: "1984", author: "George Orwell", year: 1949) {
    id
    title
  }
}

# Update a book
mutation {
  updateBook(id: "1", title: "The Great Gatsby - Updated") {
    title
  }
}

# Delete a book
mutation {
  deleteBook(id: "1")
}
```
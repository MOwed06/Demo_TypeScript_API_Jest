const Database = require('better-sqlite3');
const db = new Database('C:\\GitHub\\Demo_CSharp_API\\src\\BigBooks.API\\BigBooks.db', {readonly: true});
const book = db.prepare('SELECT * FROM books WHERE key = 6').get();
console.log('Book fields:', Object.keys(book));
console.log('ISBN values - ISBN:', book.ISBN, 'Isbn:', book.Isbn, 'isbn:', book.isbn);
console.log('Full book:', book);
db.close();

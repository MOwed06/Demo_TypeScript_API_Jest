# Demo_TypeScript_API_Jest

This project is a playground to demonstrate selected TypeScript operations including API calls and Jest.

This project is linked to the BigBooks web api project I created here: https://github.com/MOwed06/Demo_CSharp_API

<br>

## Application

The application is a brief exercise of a sampling of the operations of the BigBooks api. The following features of the application should be noted:

- spawn the BigBooks api project as a background task
  - refer to ./src/utils/process-handler.ts
  - read api output to confirm health of background task
- api-messenger.ts is the core of the project
  - api responses are wrapped in ApiResponse interface to simplify access to full properties of message exchange
  - request authorization token (GET, /api/authentication/authenticate)
  - get user account details (GET, /api/accounts/#)
  - add user account (POST, /api/accounts)
  - get current user details (GET, /api/users)
  - get book details (GET, /api/books)
  - add book (POST, /api/books)
  - add book review (POST, /api/books/#/reviews)
  - get books by genre (GET, /api/books/genre?name=)
  - purchase books (POST, /api/transactions/purchase)
- query sqlite database for raw content, refer to ./src/db-handler.ts
- verbose logging is output to timestamped log files in /logs subdirectory

<br>

## Test

By design, test included in this project is _not_ a unit of the project. It is an integtration-level exercise of BigBooks API.

more details coming soon ...

npm test

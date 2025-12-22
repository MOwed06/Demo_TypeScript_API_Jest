# Demo_TypeScript_API_Jest

This project is a playground to demonstrate selected TypeScript operations including API calls and Jest.

This project is linked to the BigBooks web api project I created here: https://github.com/MOwed06/Demo_CSharp_API

<br>

## Application

The application is a brief exercise of a sampling of the operations of the BigBooks api. The "application" spawns the server, sends a series of API requests, and terminates the server. Although brief, the following key elements of the application should be noted:

1. Deploy local server
    - The BigBooks api project is spawned as a background task
    - The output from that project is read to confirm server health
    - Refer ./src/utils/process-handler.ts

1. API messenger
    - This implements a series of calls to the BigBooks server
    - Api responses are wrapped as a generic ApiResponse to simplify test access
      - Refer to ./interfaces/api-response.ts
      - Refer to ./src/api-messenger.ts
    - The following endpoints are exercised:
      - request authorization token (GET, /api/authentication/authenticate)
      - get user account details (GET, /api/accounts/#)
      - add user account (POST, /api/accounts)
      - get current user details (GET, /api/users)
      - get book details (GET, /api/books)
      - add book (POST, /api/books)
      - add book review (POST, /api/books/#/reviews)
      - get books by genre (GET, /api/books/genre?name=)
      - purchase books (POST, /api/transactions/purchase)      

1. Database interaction
    - Direct access to the sqlite database was demonstrated using better-sqlite3.
    - Database interacts within this project are limited (just a few single row queries). This was done to 
    - Refer to ./src/db-handler.ts
  
1. Logging
    - A time-stamped log file is generated with each execute as well as each test run.
    - Logging verbosity is configured by the app-config.json loggingLevel value.

### Command Line Execution
- From directory: Demo_TypeScript_API_Jest
- Execute: tsc
- Execute: node ./dist/app.js

<br>

## Test

By design, the test included in this project do _not_ represent a unit test of the project. It is an integtration-level exercise of selected pieces of the BigBooks API.

Key elements of the test:

1. Launch BigBooks server via the beforeAll() function.
1. Test DTO responses (observed) verses expected database content
1. Test GetUser api response
    - authorization/access
    - response content
    - confirm transaction details (child array of user details)
    - customer access to other customers forbidden
    - customer access to self allowed
1. Test AddBook api response
    - add book, confirm book details in reply
    - confirm customer add book forbidden
    - confirm book with ISBN duplicate to existing forbidden
1. Test AddUser operation
    - add user, confirm user details in reply
    - confirm add user with duplicate email rejected
1. Test GetBooks operation
    - exercise GetBooksByGenre for different genre, confirm expected book list
1. Test PurchaseBooks operation
    - create book with known price and stock quantity, create user with known wallet
    - confirm success book purchase, user wallet decreased, book added to user
    - confirm rejection for insufficient customer wallet
    - confirm rejection for insufficient book stock
    - confirm rejection for deactivated user




### Command Line Execution
- From directory: Demo_TypeScript_API_Jest
- Execute: npm test


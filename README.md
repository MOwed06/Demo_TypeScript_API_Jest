# Demo_TypeScript_API_Jest

This project is a playground to demonstrate selected TypeScript operations including API calls and Jest.

This project is linked to the BigBooks web api project I created here: https://github.com/MOwed06/Demo_CSharp_API

The following features/operations should be noted:

- spawn the BigBooks api project as a background task
  - refer to ./src/utils/process-handler.ts
  - read api output to confirm health of background task
- interface with BigBooks api, refer to ./src/api-messenger.ts
  - request authorization token (GET, /api/authentication/authenticate)
  - get user account details (GET, /api/accounts/#)
  - add user account (POST, /api/accounts)
  - get book details (GET, /api/books)
  - add book (POST, /api/books)
  - add book review (POST, /api/books/#/reviews)
- query sqlite database for raw content, refer to ./src/db-handler.ts
- verbose logging is output to timestamped log files in /logs subdirectory

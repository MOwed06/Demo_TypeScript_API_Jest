/**
 * File: bigbooks.test.tsx
 * Description: demonstration of end-to-end tests for big books API.
 */

import Logger from '../../src/utils/logger';
import TestConfig from '../test-config.json';
import AppConfig from '../../src/app-config.json';
import * as ProcessHandler from '../../src/utils/process-handler';
import * as DbHandler from '../../src/db-handler';
import * as ApiMessenger from '../../src/api-messenger';
import * as RandomData from '../../src/utils/random-data';
import { Genre, HttpStatus, UserRole, TransactionType } from '../../src/enumerations';
import * as StringHelper from '../../src/utils/string-helper';
import { BookAddUpdateDto, BookDetailsDto } from '../../src/interfaces/book-interface';
import { UserAddUpdateDto } from 'src/interfaces/account-interface';
import { PurchaseRequestDto } from 'src/interfaces/transactions-interface';

// calculate delay to allow API to launch, add 2 seconds buffer
const BACKGROUND_APP_LAUNCH_DELAY_MS = AppConfig.apiLaunchDelaySec * 1000 + 5000;

// launch BigBooks server before tests
beforeAll(async () => {
  const processStatus = await ProcessHandler.startProcess({
    command: AppConfig.apiRunCommand,
    path: AppConfig.apiProjectPath,
    delaySec: AppConfig.apiLaunchDelaySec,
    confirmationText: AppConfig.apiStatusMessage,
  });
  Logger.info(`BigBooks API launched, Healthy: ${processStatus}`);
}, BACKGROUND_APP_LAUNCH_DELAY_MS);

// The DTO objects returned by API calls are related to
// but separate from the database entities.
// This suite confirms the validity of the DTO objects.
describe('DTO get operations match Database entities', () => {
  beforeEach(() => {
    Logger.info(`Starting test: ${expect.getState().currentTestName}`);
  });

  test(
    'BookDetailsDto matches Book entity',
    async () => {
      const GENTLEMEN_MOSCOW_BOOK_KEY = 6;

      const expectedBook = DbHandler.getBook(GENTLEMEN_MOSCOW_BOOK_KEY);
      const observedBook = await ApiMessenger.getBookDetails(
        {
          userId: AppConfig.adminUserId,
          password: AppConfig.defaultUserPassword,
        },
        GENTLEMEN_MOSCOW_BOOK_KEY
      );

      expect(observedBook.data?.title).toBe(expectedBook.title);
      expect(observedBook.data?.author).toBe(expectedBook.author);
      // must cast to enumeration to string for apples-to-apples comparison
      const expectedGenreString = Genre[expectedBook.genre];
      expect(observedBook.data?.genre).toBe(expectedGenreString);
      expect(observedBook.data?.isbn).toBe(expectedBook.isbn);
    },
    TestConfig.longTestTimeout
  );

  test(
    'UserDetailsDto matches AppUser entity',
    async () => {
      Logger.info(expect.getState().currentTestName);
      const ANDERSON_USER_KEY = 4;

      const expectedUser = DbHandler.getUser(ANDERSON_USER_KEY);
      const observedUser = await ApiMessenger.getUserDetails(
        {
          userId: AppConfig.adminUserId,
          password: AppConfig.defaultUserPassword,
        },
        ANDERSON_USER_KEY
      );
      expect(observedUser.data?.userEmail).toBe(expectedUser.userEmail);
      expect(observedUser.data?.isActive).toBe(expectedUser.isActive);
      const expectedRoleString = UserRole[expectedUser.role];
      expect(observedUser.data?.role).toBe(expectedRoleString);
      const expectedWalletString = StringHelper.toUSD(expectedUser.wallet);
      expect(observedUser.data?.wallet).toBe(expectedWalletString);
    },
    TestConfig.longTestTimeout
  );
});

describe('getUserDetails operation', () => {
  const ANDERSON_USER_KEY = 4;
  const ANDERSON_USER_EMAIL = 'Arthur.Anderson@demo.com';
  const TUCKER_USER_EMAIL = 'Savannah.Tucker@demo.com';

  beforeEach(() => {
    Logger.info(`Starting test: ${expect.getState().currentTestName}`);
  });

  test(
    'Admin access getUserDetails',
    async () => {
      const response = await ApiMessenger.getUserDetails(
        {
          userId: AppConfig.adminUserId,
          password: AppConfig.defaultUserPassword,
        },
        ANDERSON_USER_KEY
      );
      expect(response.status).toBe(HttpStatus.OK);
      expect(response.data?.userEmail).toBe(ANDERSON_USER_EMAIL);
    },
    TestConfig.longTestTimeout
  );

  test(
    'getUserDetails, account info',
    async () => {
      const response = await ApiMessenger.getUserDetails(
        {
          userId: AppConfig.adminUserId,
          password: AppConfig.defaultUserPassword,
        },
        ANDERSON_USER_KEY
      );
      // expect 3 transactions in account history
      expect(response.status).toBe(HttpStatus.OK);
      expect(response.data?.userEmail).toBe(ANDERSON_USER_EMAIL);
      expect(response.data?.role).toBe(UserRole[UserRole.Customer]);
      expect(response.data?.isActive).toBe(true);
      expect(response.data?.wallet).toBe('$100.00');
      expect(response.data?.transactions).toHaveLength(3);
    },
    TestConfig.longTestTimeout
  );

  test(
    'getUserDetails, transaction info',
    async () => {
      const response = await ApiMessenger.getUserDetails(
        {
          userId: AppConfig.adminUserId,
          password: AppConfig.defaultUserPassword,
        },
        ANDERSON_USER_KEY
      );
      // expect book purchase transaction on date 2025-03-17
      const EXPECTED_TRANSACTION_DATE = '2025-03-17';
      const transactionUserDetails = response.data?.transactions.find((tx) =>
        tx.transactionDate.startsWith(EXPECTED_TRANSACTION_DATE)
      );
      expect(transactionUserDetails).toBeDefined();
      expect(transactionUserDetails?.transactionType).toBe(
        TransactionType[TransactionType.Purchase]
      );
      expect(transactionUserDetails?.transactionAmount).toBe(-13.91);
      expect(transactionUserDetails?.purchaseBookKey).toBe(3);
      expect(transactionUserDetails?.purchaseQuantity).toBe(1);
    },
    TestConfig.longTestTimeout
  );

  test(
    'Customer access getCurrentUserDetails',
    async () => {
      const response = await ApiMessenger.getCurrentUserDetails({
        userId: ANDERSON_USER_EMAIL,
        password: AppConfig.defaultUserPassword,
      });
      expect(response.status).toBe(HttpStatus.OK);
      expect(response.data?.userEmail).toBe(ANDERSON_USER_EMAIL);
    },
    TestConfig.longTestTimeout
  );

  test(
    'getUserDetails, access to separate user - Forbidden',
    async () => {
      const response = await ApiMessenger.getUserDetails(
        {
          userId: TUCKER_USER_EMAIL,
          password: AppConfig.defaultUserPassword,
        },
        ANDERSON_USER_KEY
      );
      expect(response.status).toBe(HttpStatus.Forbidden);
    },
    TestConfig.longTestTimeout
  );

  test(
    'Invalid User - Unauthorized',
    async () => {
      const response = await ApiMessenger.getUserDetails(
        {
          userId: 'user.unknown@demo.com',
          password: AppConfig.defaultUserPassword,
        },
        ANDERSON_USER_KEY
      );

      expect(response.status).toBe(HttpStatus.Unauthorized);
      expect(response.error).toContain('User not found');
    },
    TestConfig.longTestTimeout
  );

  test(
    'Invalid Password - Unauthorized',
    async () => {
      const response = await ApiMessenger.getUserDetails(
        {
          userId: AppConfig.adminUserId,
          password: 'wrongpassword',
        },
        ANDERSON_USER_KEY
      );

      expect(response.status).toBe(HttpStatus.Unauthorized);
      expect(response.error).toContain('Invalid password');
    },
    TestConfig.longTestTimeout
  );
});

describe('addBook operation', () => {
  // existing book ISBN
  const BOOK_2_ISBN = '31AB208D-EA2D-458B-B708-744E16BBDE5A';

  let newBookDto: BookAddUpdateDto;

  // not the full enumeration, just a sample for testing
  const genreList: Genre[] = [
    Genre.Fiction,
    Genre.Childrens,
    Genre.Fantasy,
    Genre.Mystery,
    Genre.Biography,
  ];

  beforeEach(() => {
    Logger.info(`Starting test: ${expect.getState().currentTestName}`);
    // randomize book details to avoid conflicts
    newBookDto = {
      title: RandomData.randomSentence(),
      author: RandomData.randomPerson(),
      isbn: RandomData.generateGUID().toUpperCase(),
      description: RandomData.randomSentence(),
      genre: RandomData.selectFromArray(genreList),
      price: RandomData.randomDecimal(12.01, 23.01),
      stockQuantity: 10,
    };
  });

  test(
    'addBook as Admin user',
    async () => {
      const response = await ApiMessenger.addBook(
        {
          userId: AppConfig.adminUserId,
          password: AppConfig.defaultUserPassword,
        },
        newBookDto
      );

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.data).toBeDefined();
      expect(response.data?.title).toBe(newBookDto.title);
      expect(response.data?.author).toBe(newBookDto.author);
      expect(response.data?.isbn).toBe(newBookDto.isbn);
      expect(response.data?.description).toBe(newBookDto.description);
      expect(response.data?.genre).toBe(Genre[newBookDto.genre]);
      const expectedPriceString = StringHelper.toUSD(newBookDto.price);
      expect(response.data?.price).toBe(expectedPriceString);
      expect(response.data?.inStock).toBe(true);
      expect(response.data?.key).toBeGreaterThan(0);
    },
    TestConfig.longTestTimeout
  );

  test(
    'Customer cannot add a book - Forbidden',
    async () => {
      const TUCKER_USER_EMAIL = 'Savannah.Tucker@demo.com';

      const response = await ApiMessenger.addBook(
        {
          userId: TUCKER_USER_EMAIL,
          password: AppConfig.defaultUserPassword,
        },
        newBookDto
      );

      expect(response.status).toBe(HttpStatus.Forbidden);
    },
    TestConfig.longTestTimeout
  );

  test(
    'Invalid, duplicate ISBN - Bad Request',
    async () => {
      newBookDto.isbn = BOOK_2_ISBN;
      const response = await ApiMessenger.addBook(
        {
          userId: AppConfig.adminUserId,
          password: AppConfig.defaultUserPassword,
        },
        newBookDto
      );

      expect(response.status).toBe(HttpStatus.BadRequest);
      expect(response.error).toContain('Duplicate ISBN');
    },
    TestConfig.longTestTimeout
  );
});

describe('addUser operation', () => {
  let newUserAddDto: UserAddUpdateDto;
  beforeEach(() => {
    Logger.info(`Starting test: ${expect.getState().currentTestName}`);

    const newUserName = RandomData.randomPerson();
    newUserAddDto = {
      userEmail: `${newUserName.replace(' ', '.')}@demo.com`,
      userName: newUserName,
      password: 'TestPassword123!',
      role: UserRole.Customer,
      isActive: true,
      wallet: RandomData.randomDecimal(100, 200),
    };
  });

  test(
    'Add new user as Admin',
    async () => {
      const response = await ApiMessenger.addUser(
        {
          userId: AppConfig.adminUserId,
          password: AppConfig.defaultUserPassword,
        },
        newUserAddDto
      );
      expect(response.status).toBe(HttpStatus.OK);
      expect(response.data).toBeDefined();
      expect(response.data?.userEmail).toBe(newUserAddDto.userEmail);
      expect(response.data?.role).toBe(UserRole[UserRole.Customer]);
      expect(response.data?.isActive).toBe(true);
      expect(response.data?.key).toBeGreaterThan(0);
    },
    TestConfig.longTestTimeout
  );

  test(
    'Duplicate user email - Bad Request',
    async () => {
      const TUCKER_USER_EMAIL = 'Savannah.Tucker@demo.com';
      newUserAddDto.userEmail = TUCKER_USER_EMAIL;
      const response = await ApiMessenger.addUser(
        {
          userId: AppConfig.adminUserId,
          password: AppConfig.defaultUserPassword,
        },
        newUserAddDto
      );
      expect(response.status).toBe(HttpStatus.BadRequest);
      expect(response.error).toContain('Duplicate UserEmail');
    },
    TestConfig.longTestTimeout
  );
});

describe('getBooksByGenre operation', () => {
  const TUCKER_USER_EMAIL = 'Savannah.Tucker@demo.com';

  const CHILDRENS_BOOKS = [
    'The Stinky Cheese Man and Other Fairly Stupid Tales',
    'Too Many Frogs',
    'Gregor and the Prophecy of Bane',
    'Where the Wild Things Are',
  ];

  const HISTORY_BOOKS = ['Citizen Soldiers', 'The American Revolution: An Intimate History'];

  const FANTASY_BOOKS = ['The Way of Kings', 'The Hunger Games'];

  beforeEach(() => {
    Logger.info(`Starting test: ${expect.getState().currentTestName}`);
  });

  test.each([
    [Genre.Childrens, CHILDRENS_BOOKS],
    [Genre.History, HISTORY_BOOKS],
    [Genre.Fantasy, FANTASY_BOOKS],
  ])(
    'Get books by Genre - %s',
    async (searchGenre, expectedTitles) => {
      const response = await ApiMessenger.getBooksByGenre(
        {
          userId: TUCKER_USER_EMAIL,
          password: AppConfig.defaultUserPassword,
        },
        Genre[searchGenre]
      );
      expect(response.status).toBe(HttpStatus.OK);
      expect(response.data).toBeDefined();
      expect(response.data?.length).toBeGreaterThanOrEqual(expectedTitles.length);
      // confirm expected book titles exist in response
      expectedTitles.forEach((expectedBook) => {
        const bookFound = response.data?.find((bk) => bk.title === expectedBook);
        expect(bookFound).toBeDefined();
      });
      expect(response.data?.every((bk) => bk.genre === Genre[searchGenre])).toBe(true);
    },
    TestConfig.longTestTimeout
  );
});

describe('purchaseBooks operation', () => {
  const BOOK_PRICE = 20.0;
  const DEFAULT_WALLET_AMOUNT = 30.0;
  let newBookDetails: BookDetailsDto;
  let newUserAddDto: UserAddUpdateDto;
  beforeEach(async () => {
    Logger.info(`Starting test: ${expect.getState().currentTestName}`);

    // populate new user dto, but do (yet) add to system
    const newUserName = RandomData.randomPerson();
    newUserAddDto = {
      userEmail: `${newUserName.replace(' ', '.')}@demo.com`,
      userName: newUserName,
      password: 'TestPassword123!',
      role: UserRole.Customer,
      isActive: true,
      wallet: DEFAULT_WALLET_AMOUNT, // sufficient funds for single book purchase test
    };

    // before each test, create a new book with
    // price = $20 and stockQuantity = 3
    const newBookDto: BookAddUpdateDto = {
      title: RandomData.randomSentence(),
      author: RandomData.randomPerson(),
      isbn: RandomData.generateGUID(),
      description: RandomData.randomSentence(),
      genre: Genre.Fiction,
      price: BOOK_PRICE,
      stockQuantity: 3,
    };

    const addBookResponse = await ApiMessenger.addBook(
      {
        userId: AppConfig.adminUserId,
        password: AppConfig.defaultUserPassword,
      },
      newBookDto
    );
    expect(addBookResponse.status).toBe(HttpStatus.OK);
    expect(addBookResponse.data).toBeDefined();
    newBookDetails = addBookResponse.data!; // force non-null for test use
    Logger.info(`New book Key: ${newBookDetails.key}`);
  });

  test(
    'Purchase book success',
    async () => {
      // first, add new user to system
      const addUserResponse = await ApiMessenger.addUser(
        {
          userId: AppConfig.adminUserId,
          password: AppConfig.defaultUserPassword,
        },
        newUserAddDto
      );
      expect(addUserResponse.status).toBe(HttpStatus.OK);
      expect(addUserResponse.data).toBeDefined();
      Logger.debug(`Added new user: ${addUserResponse.data?.key}`);

      const purchaseRequestDto: PurchaseRequestDto = {
        bookKey: newBookDetails.key,
        transactionConfirmation: RandomData.generateGUID(),
        requestedQuantity: 1,
      };

      const purchaseResponse = await ApiMessenger.purchaseBooks(
        {
          userId: newUserAddDto.userEmail,
          password: newUserAddDto.password,
        },
        purchaseRequestDto
      );
      expect(purchaseResponse.status).toBe(HttpStatus.OK);
      expect(purchaseResponse.data).toBeDefined();
      expect(purchaseResponse.data?.wallet).toBe('$10.00'); // $30 - $20 = $10
      // expect child transaction with book key
      const purchaseTransaction = purchaseResponse.data?.transactions.find(
        (tx) => tx.purchaseBookKey === newBookDetails.key
      );
      expect(purchaseTransaction).toBeDefined(); // confirm transaction with key exists
    },
    TestConfig.longTestTimeout
  );

  test(
    'Purchase book insufficient funds',
    async () => {
      // first, add new user to system
      const addUserResponse = await ApiMessenger.addUser(
        {
          userId: AppConfig.adminUserId,
          password: AppConfig.defaultUserPassword,
        },
        newUserAddDto
      );
      expect(addUserResponse.status).toBe(HttpStatus.OK);
      expect(addUserResponse.data).toBeDefined();
      Logger.debug(`Added new user: ${addUserResponse.data?.key}`);
      const purchaseRequestDto: PurchaseRequestDto = {
        bookKey: newBookDetails.key,
        transactionConfirmation: RandomData.generateGUID(),
        requestedQuantity: 2, // $40 purchase, exceeds $30 wallet
      };
      const purchaseResponse = await ApiMessenger.purchaseBooks(
        {
          userId: newUserAddDto.userEmail,
          password: newUserAddDto.password,
        },
        purchaseRequestDto
      );
      expect(purchaseResponse.status).toBe(HttpStatus.BadRequest);
      expect(purchaseResponse.error).toContain('Insufficient funds');
    },
    TestConfig.longTestTimeout
  );

  test(
    'Purchase book insufficient stock',
    async () => {
      // first, add new user to system. increase wallet to cover purchase
      newUserAddDto.wallet = 200.0; // increase wallet to avoid insufficient funds
      const addUserResponse = await ApiMessenger.addUser(
        {
          userId: AppConfig.adminUserId,
          password: AppConfig.defaultUserPassword,
        },
        newUserAddDto
      );
      expect(addUserResponse.status).toBe(HttpStatus.OK);
      expect(addUserResponse.data).toBeDefined();
      Logger.debug(`Added new user: ${addUserResponse.data?.key}`);
      const purchaseRequestDto: PurchaseRequestDto = {
        bookKey: newBookDetails.key,
        transactionConfirmation: RandomData.generateGUID(),
        requestedQuantity: 5, // exceeds stock quantity of 3
      };
      const purchaseResponse = await ApiMessenger.purchaseBooks(
        {
          userId: newUserAddDto.userEmail,
          password: newUserAddDto.password,
        },
        purchaseRequestDto
      );
      expect(purchaseResponse.status).toBe(HttpStatus.BadRequest);
      expect(purchaseResponse.error).toContain('Insufficient book stock');
    },
    TestConfig.longTestTimeout
  );

  test(
    "Inative user can't purchase book",
    async () => {
      // first, add new user to system with isActive = false
      newUserAddDto.isActive = false;
      const addUserResponse = await ApiMessenger.addUser(
        {
          userId: AppConfig.adminUserId,
          password: AppConfig.defaultUserPassword,
        },
        newUserAddDto
      );
      expect(addUserResponse.status).toBe(HttpStatus.OK);
      expect(addUserResponse.data).toBeDefined();
      Logger.debug(`Added new user: ${addUserResponse.data?.key}`);
      const purchaseRequestDto: PurchaseRequestDto = {
        bookKey: newBookDetails.key,
        transactionConfirmation: RandomData.generateGUID(),
        requestedQuantity: 1,
      };
      const purchaseResponse = await ApiMessenger.purchaseBooks(
        { userId: newUserAddDto.userEmail, password: newUserAddDto.password },
        purchaseRequestDto
      );
      expect(purchaseResponse.status).toBe(HttpStatus.BadRequest);
      expect(purchaseResponse.error).toContain('User is deactivated');
    },
    TestConfig.longTestTimeout
  );
});

afterAll(() => {
  ProcessHandler.endProcess();
  Logger.info('Closing BigBooks API process after tests');
});

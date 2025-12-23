/**
 * File: app.ts
 * Description: demonstration of selected features of the BigBooks API
 * for more details, refer to: https://github.com/MOwed06/Demo_CSharp_API
 */

import Logger from './utils/logger';
import * as ProcessHandler from './utils/process-handler';
import * as Config from './app-config.json';
import * as TimeHelper from './utils/time-helper';
import * as DbHandler from './db-handler';
import * as ApiMessenger from './api-messenger';
import { displayWithTime } from './utils/console-helper';
import * as RandomData from './utils/random-data';
import { Genre, UserRole } from './enumerations';
import { UserAddUpdateDto, UserJsonPatchOperation } from './interfaces/account-interface';
import { PurchaseRequestDto } from './interfaces/transactions-interface';

async function main(): Promise<void> {
  try {
    displayWithTime('Application started');
    console.log('\n');

    // launch the API process in the background
    displayWithTime(`Starting API process...`);
    const processStatus = await ProcessHandler.startProcess({
      command: Config.apiRunCommand,
      path: Config.apiProjectPath,
      delaySec: Config.apiLaunchDelaySec,
      confirmationText: Config.apiStatusMessage,
    });

    console.log(`${TimeHelper.getTimeMSec()} - API launched, Healthy: ${processStatus}\n`);

    // demonstrate authorization rejected
    const badResponse = await ApiMessenger.getBookDetails(
      {
        userId: 'somebugy@demo.com',
        password: Config.defaultUserPassword,
      },
      2
    );
    console.log('Authorization response:', badResponse);
    console.log('\n');

    // demonstrate get user details for known user
    const ANDERSON_USER_KEY = 4;
    const userDetails = await ApiMessenger.getUserDetails(
      {
        userId: Config.adminUserId,
        password: Config.defaultUserPassword,
      },
      ANDERSON_USER_KEY
    );
    console.log('User details response:', userDetails.data);

    // search user details for particular transaction
    const EXPECTED_TRANSACTION_DATE = '2025-03-17';
    const transactionUserDetails = userDetails.data?.transactions.find((tx) =>
      tx.transactionDate.startsWith(EXPECTED_TRANSACTION_DATE)
    );
    // expect book 3 purchased on 2025-03-17
    console.log(`Transaction on ${EXPECTED_TRANSACTION_DATE}:`, transactionUserDetails);
    console.log('\n');

    // create a new book
    const newBookAddDto = {
      title: `The Adventures of ${RandomData.randomPerson()}`,
      author: RandomData.randomPerson(),
      isbn: RandomData.generateGUID(),
      description: RandomData.randomSentence(),
      genre: Genre.Fantasy,
      price: RandomData.randomDecimal(10, 100),
      stockQuantity: 50,
    };

    const newBookResponse = await ApiMessenger.addBook(
      {
        userId: Config.adminUserId,
        password: Config.defaultUserPassword,
      },
      newBookAddDto
    );
    console.log('New book response:', newBookResponse.data);
    console.log('\n');

    // confirm database content for added book
    if (!newBookResponse?.data?.key) {
      displayWithTime('ERROR: New book response is missing the book key');
    } else {
      const dbBookRecord = DbHandler.getBook(newBookResponse.data.key);
      console.log('DB book record:', dbBookRecord);
      console.log('\n');
    }

    // create new user
    const newUserName = RandomData.randomPerson();
    const userWallet = newBookAddDto.price + 20; // ensure enough funds to buy the book
    const newUserAddDto: UserAddUpdateDto = {
      userEmail: `${newUserName.replace(' ', '.')}@demo.com`,
      userName: newUserName,
      password: Config.defaultUserPassword,
      role: UserRole.Customer,
      isActive: true,
      wallet: userWallet,
    };
    const newUserResponse = await ApiMessenger.addUser(
      {
        userId: Config.adminUserId,
        password: Config.defaultUserPassword,
      },
      newUserAddDto
    );
    console.log('New user response:', newUserResponse.data);
    console.log('\n');

    if (!newUserResponse?.data?.key) {
      displayWithTime('ERROR: New user response is missing the user key');
    } else {
      // confirm database content for added user
      const dbUserRecord = DbHandler.getUser(newUserResponse.data.key);
      console.log('DB user record:', dbUserRecord);
      console.log('\n');

      // alter user wallet and user name
      // note that user email is unchanged
      const newWallet = userWallet + 50;
      const revisedUserName = RandomData.randomPerson();
      const patch: UserJsonPatchOperation[] = [
        {
          op: 'replace',
          path: '/wallet',
          value: newWallet,
        },
        {
          op: 'replace',
          path: '/userName',
          value: revisedUserName,
        },
      ];

      const updateUserResponse = await ApiMessenger.updateAccount(
        {
          userId: Config.adminUserId,
          password: Config.defaultUserPassword,
        },
        newUserResponse.data.key,
        patch
      );
      console.log('Update user response:', updateUserResponse.data);
      console.log('\n');
    }

    if (!newUserResponse?.data?.key || !newBookResponse?.data?.key) {
      displayWithTime('ERROR: bad user or bad book key, cannot create review');
    } else {
      // create a book review for a added book
      const bookReview = await ApiMessenger.addBookReview(
        {
          userId: newUserAddDto.userEmail,
          password: Config.defaultUserPassword,
        },
        newBookResponse.data.key,
        {
          score: 7,
          isAnonymous: false,
          description: 'Great book, highly recommend!',
        }
      );
      console.log('Book review response:', bookReview.data);
      console.log('\n');

      // purchase book for user
      const purchaseRequestDto: PurchaseRequestDto = {
        bookKey: newBookResponse.data.key,
        transactionConfirmation: RandomData.generateGUID(),
        requestedQuantity: 1,
      };

      const purchaseResponse = await ApiMessenger.purchaseBooks(
        {
          userId: newUserAddDto.userEmail,
          password: Config.defaultUserPassword,
        },
        purchaseRequestDto
      );
      console.log('Purchase response:', purchaseResponse.data);
      console.log('\n');
    }

    // get books by genre (Childrens)
    const childrensBooks = await ApiMessenger.getBooksByGenre(
      {
        userId: Config.adminUserId,
        password: Config.defaultUserPassword,
      },
      Genre[Genre.Childrens]
    );
    const bookTitles = childrensBooks.data?.map((book) => book.title).join('; ');
    console.log(`Childrens books titles: ${bookTitles}`);

    console.log('\n');

    // wait a bit before closing everything
    await TimeHelper.waitSeconds(2);
  } catch (error) {
    // this is bad! +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    Logger.error(`Fatal error in main: ${error}`);
    console.error(`Fatal error in main: ${error}`);
  } finally {
    // close things nicely ++++++++++++++++++++++++++++++++++++++++++++++++++++
    displayWithTime('Closing background process');
    ProcessHandler.endProcess();
    displayWithTime('Application exiting');
  }
}

main();

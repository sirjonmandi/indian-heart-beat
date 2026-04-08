import AsyncStorage from '@react-native-async-storage/async-storage';
import SQLite from 'react-native-sqlite-storage';

const db = SQLite.openDatabase({ name: 'accessToken.db', location: 'default' });

export const getAccessToken = async () => {
  let token = await AsyncStorage.getItem('access_token');

  if (!token) {
    await new Promise(resolve => {
      db.transaction(tx => {
        tx.executeSql('SELECT access_token FROM token_table;', [], (tx, results) => {
          if (results.rows.length > 0) {
            token = results.rows.item(0).access_token;
            AsyncStorage.setItem('access_token', token);
          }
          resolve();
        });
      });
    });
  }

  // console.log('Access Token: ' + token);
  return token;
};

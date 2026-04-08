/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import { LogBox } from 'react-native';
import messaging from '@react-native-firebase/messaging';

require("./ReactotronConfig");

// Disable warnings & RedBox errors temporarily
// if (__DEV__) {
//     LogBox.ignoreAllLogs(true); // Hides all logs and warnings
//     console.error = () => {};   // Suppresses RedBox error popups
// }

messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Message handled in the background!', remoteMessage);
});

AppRegistry.registerComponent(appName, () => App);

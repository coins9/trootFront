/**
 * @format
 */

import 'react-native-gesture-handler';
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { notificationService } from './src/infrastructure/notifications/notificationService';

// 앱 종료 상태에서도 백그라운드 메시지를 처리하기 위해 최상단에서 등록
notificationService.setBackgroundHandler();

AppRegistry.registerComponent(appName, () => App);

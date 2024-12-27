import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_background_service/flutter_background_service.dart';
import 'dart:io' show Platform; // To check platform
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'my_home_page.dart';

// Initialize the FlutterLocalNotificationsPlugin
final FlutterLocalNotificationsPlugin flutterLocalNotificationsPlugin =
FlutterLocalNotificationsPlugin();

void main() {
  runApp(const MyApp());
  _requestNotificationPermission();
  initializeService();
  initializeNotifications();
}

Future<void> initializeNotifications() async {
  // Android settings
  const AndroidInitializationSettings initializationSettingsAndroid =
  AndroidInitializationSettings('@mipmap/ic_launcher');

  // iOS (Darwin) settings
  const DarwinInitializationSettings initializationSettingsDarwin =
  DarwinInitializationSettings(
    requestAlertPermission: true,
    requestBadgePermission: true,
    requestSoundPermission: true,
  );

  // Combine settings for both platforms
  const InitializationSettings initializationSettings = InitializationSettings(
    android: initializationSettingsAndroid,
    iOS: initializationSettingsDarwin,
  );

  // Initialize the plugin
  await flutterLocalNotificationsPlugin.initialize(initializationSettings);
}

Future<void> _requestNotificationPermission() async {
  if (Platform.isAndroid) {
    // Android 13 or higher requires notification permission
    final androidFlutterLocalNotificationsPlugin =
    flutterLocalNotificationsPlugin.resolvePlatformSpecificImplementation<
        AndroidFlutterLocalNotificationsPlugin>();

    final bool? granted = await androidFlutterLocalNotificationsPlugin?.requestNotificationsPermission();

    if (granted == null || !granted) {
      debugPrint("Notification permission denied on Android");
    }
  } else if (Platform.isIOS) {
    // iOS permissions request
    final bool? granted = await flutterLocalNotificationsPlugin
        .resolvePlatformSpecificImplementation<
        IOSFlutterLocalNotificationsPlugin>()
        ?.requestPermissions(
      alert: true,
      badge: true,
      sound: true,
    );

    if (granted == null || !granted) {
      debugPrint("Notification permission denied on iOS");
    }
  }
}

// Initialize Flutter Background Service
Future<void> initializeService() async {
  final service = FlutterBackgroundService();

  await service.configure(
    androidConfiguration: AndroidConfiguration(
      onStart: onStart,
      autoStart: true, // Start automatically when the app runs
      isForegroundMode: true, // Run in foreground when the app is minimized
    ),
    iosConfiguration: IosConfiguration(
      onForeground: onStart,
      onBackground: (service) => true,
    ),
  );

  service.startService(); // Start the service
}

// The entry point for the background service
void onStart(ServiceInstance service) {
  // This is where the background task runs

  // Run periodic tasks
  Timer.periodic(Duration(seconds: 10), (timer) async {
    // Send data to the foreground every 10 seconds
    service.invoke("check_web_socket", {});
  });
}



class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'TARPN',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepPurple),
        useMaterial3: true,
      ),
      home: const MyHomePage(title: 'TARPN'),
    );
  }
}

class MyHomePage extends StatefulWidget {
  const MyHomePage({super.key, required this.title});

  final String title;

  @override
  State<MyHomePage> createState() => MyHomePageState();
}
#!/bin/bash
cd ..
flutter build apk
cp build/app/outputs/flutter-apk/app-release.apk ./bin

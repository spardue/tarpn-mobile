import 'package:flutter_test/flutter_test.dart';
import 'package:tarpn_mobile/chat_message.dart';

void main() {
  group('parseChatMessage', () {
    test('parses plain text message correctly', () {
      final rawMessage = '04:14 PM: KQ4TTT Stephen : hello all';
      final result = parseChatMessage(rawMessage, false);

      expect(result, isNotNull);
      expect(result?.time, '04:14 PM');
      expect(result?.callSign, 'KQ4TTT');
      expect(result?.name, 'Stephen');
      expect(result?.message, 'hello all');
      expect(result?.color, '#000000');
      expect(result?.notification, false);
    });

    test('parses HTML message correctly', () {
      final rawMessage =
          '<span style="color:#000000;font-weight:bold;font-size=13px">04:14 PM: KQ4TTT Stephen : hello all</span>';
      final result = parseChatMessage(rawMessage, true);

      expect(result, isNotNull);
      expect(result?.time, '04:14 PM');
      expect(result?.callSign, 'KQ4TTT');
      expect(result?.name, 'Stephen');
      expect(result?.message, 'hello all');
      expect(result?.color, '#000000');
      expect(result?.notification, true);
    });

    test('returns null for unknown message format', () {
      final rawMessage = 'Some random message';
      final result = parseChatMessage(rawMessage, false);

      expect(result, isNull);
    });

    test('handles unicode decoding in message content', () {
      final rawMessage =
          '12:34 PM: CALLSIGN Name : Hello, \\u0048\\u0065\\u006C\\u006C\\u006F!';
      final result = parseChatMessage(rawMessage, false);

      expect(result, isNotNull);
      expect(result?.message, 'Hello, Hello!');
    });

    test('parses message without name correctly', () {
      final rawMessage = '04:21 PM: KQ4TTT : test';
      final result = parseChatMessage(rawMessage, false);

      expect(result, isNotNull);
      expect(result?.time, '04:21 PM');
      expect(result?.callSign, 'KQ4TTT');
      expect(result?.name, isEmpty);
      expect(result?.message, 'test');
    });

    test('removes new lines', () {
      final rawMessage = '04:21 PM: KQ4TTT : a\nb\nc';
      final result = parseChatMessage(rawMessage, false);

      expect(result, isNotNull);
      expect(result?.time, '04:21 PM');
      expect(result?.callSign, 'KQ4TTT');
      expect(result?.name, isEmpty);
      expect(result?.message, 'abc');
    });

    test('properly parse messages with time', () {
      final rawMessage = '06:01 PM: 22:01 KQ4TTT Stephen : Testing time';
      final result = parseChatMessage(rawMessage, false);

      expect(result, isNotNull);
      expect(result?.time, '06:01 PM');
      expect(result?.callSign, 'KQ4TTT');
      expect(result?.name, 'Stephen');
      expect(result?.message, 'Testing time');
    });
  });
}
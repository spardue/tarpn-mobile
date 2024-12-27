import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:numberpicker/numberpicker.dart'; // Import NumberPicker


const int defaultMessages = 50;

class SettingsPage extends StatefulWidget {
  const SettingsPage({super.key});

  @override
  State<SettingsPage> createState() => _SettingsPageState();
}

class _SettingsPageState extends State<SettingsPage> {
  final TextEditingController _callSignController = TextEditingController();
  final TextEditingController _hostController = TextEditingController();
  final TextEditingController _portController = TextEditingController();
  int _maxMessages = defaultMessages; // Store selected max messages

  @override
  void initState() {
    super.initState();
    _loadSettings();
  }

  Future<void> _loadSettings() async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    setState(() {
      _callSignController.text = prefs.getString('call_sign') ?? 'MYCALL';
      _hostController.text = prefs.getString('ip_address') ?? '127.0.0.1';
      _portController.text = (prefs.getInt('port') ?? 8085).toString();
      _maxMessages = prefs.getInt('max_messages') ?? defaultMessages; // Load max messages
    });
  }

  Future<void> _saveSettings() async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    await prefs.setString('call_sign', _callSignController.text);
    await prefs.setString('ip_address', _hostController.text);
    await prefs.setInt('port', int.parse(_portController.text));
    await prefs.setInt('max_messages', _maxMessages); // Save max messages
    Navigator.pop(context); // Go back to the main screen after saving
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Settings'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            TextField(
              controller: _callSignController,
              decoration: const InputDecoration(labelText: 'Call Sign'),
            ),
            TextField(
              controller: _hostController,
              decoration: const InputDecoration(labelText: 'Host'),
            ),
            TextField(
              controller: _portController,
              decoration: const InputDecoration(labelText: 'Port'),
              keyboardType: TextInputType.number,
            ),
            const SizedBox(height: 20),
            Text("Max Messages: $_maxMessages"), // Show the current value
            NumberPicker(
              minValue: 50,
              maxValue: 1000,
              value: _maxMessages,
              step: 50,
              onChanged: (value) {
                setState(() {
                  _maxMessages = value;
                });
              },
            ), // NumberPicker widget for selecting max messages
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: _saveSettings,
              child: const Text('Save'),
            ),
          ],
        ),
      ),
    );
  }
}

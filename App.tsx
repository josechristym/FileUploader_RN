import * as React from 'react';
import { StyleSheet, View, Text, Button } from 'react-native';
import DocumentPicker, {
  DirectoryPickerResponse,
  DocumentPickerResponse,
  isCancel,
  isInProgress,
  types,
} from 'react-native-document-picker';
import { useState, useEffect } from 'react';
import SSHClient from '@dylankenneally/react-native-ssh-sftp';

export default function App() {
  const [result, setResult] = useState<
    Array<DocumentPickerResponse> | DirectoryPickerResponse | undefined | null
  >();

  useEffect(() => {
    console.log(JSON.stringify(result, null, 2));
    if (result) {
      uploadFile(result);
    }
  }, [result]);

  const uploadFile = async (file: DocumentPickerResponse | DocumentPickerResponse[]) => {
    try {
      const client = await SSHClient.connectWithPassword(
        "77.92.187.10",
        22,
        "Finexsftptest",
        "Integration@2023"
      );
      console.log("Connected client", client);

      const filesToUpload = Array.isArray(file) ? file : [file];

      for (const selectedFile of filesToUpload) {
        const localFilePath = selectedFile.uri;
        console.log("localFilePath", localFilePath);
        await client.sftpUpload(localFilePath, "/C:/SFTPTest/");
        console.log("File upload success");
      }

      client.disconnect(); // Disconnect after uploading all files
    } catch (error) {
      console.error('Error uploading files:', error);
    }
  };

  const handleError = (err: unknown) => {
    if (isCancel(err)) {
      console.warn('cancelled');
      // User cancelled the picker, exit any dialogs or menus and move on
    } else if (isInProgress(err)) {
      console.warn('multiple pickers were opened, only the last will be considered');
    } else {
      throw err;
    }
  };

  return (
    <View style={styles.container}>
      <Button
        title="Open picker for multi file selection"
        onPress={() => {
          DocumentPicker.pick({ allowMultiSelection: true })
            .then((pickedFiles) => setResult(pickedFiles))
            .catch(handleError);
        }}
      />
      <Button
        title="Open directory picker"
        onPress={() => {
          DocumentPicker.pickDirectory()
            .then((pickedDirectory) => setResult(pickedDirectory))
            .catch(handleError);
        }}
      />
      <Text selectable>Result: {JSON.stringify(result, null, 2)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
});

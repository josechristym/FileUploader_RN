import * as React from 'react'

import { StyleSheet, View, Text, Button } from 'react-native'
import DocumentPicker, {
  DirectoryPickerResponse,
  DocumentPickerResponse,
  isCancel,
  isInProgress,
  types,
} from 'react-native-document-picker'
import { useEffect } from 'react'
import { Client } from 'ssh2-sftp-client';

export default function App() {

  const [result, setResult] = React.useState<
    Array<DocumentPickerResponse> | DirectoryPickerResponse | undefined | null
  >()

  useEffect(() => {
    console.log(JSON.stringify(result, null, 2))
    uploadFile()
  }, [result])

  const uploadFile = async () => {
    const sftp = new Client();
    try {
      await sftp.connect({
        host: 'tallycloud.me',
        port: 22,
        username: 'Finexsftptest',
        password: 'Integration@2023'
      });
  
      if (Array.isArray(result)) {
        for (const file of result) {
          const localFilePath = file.uri;
          await sftp.putFile(localFilePath, "/C:/SFTPTest");
        }
      } else if(result){
        const localFilePath = result.uri; 
        await sftp.putFile(localFilePath, "/C:/SFTPTest");
      }
      console.log('Files uploaded successfully');
    } catch (error) {
      console.error('Error uploading files:', error);
    } finally {
      await sftp.end();
    }
  }
  

  const handleError = (err: unknown) => {
    if (isCancel(err)) {
      console.warn('cancelled')
      // User cancelled the picker, exit any dialogs or menus and move on
    } else if (isInProgress(err)) {
      console.warn('multiple pickers were opened, only the last will be considered')
    } else {
      throw err
    }
  }

  return (
    <View style={styles.container}>
      
      <Button
        title="open picker for multi file selection"
        onPress={() => {
          DocumentPicker.pick({ allowMultiSelection: true }).then(setResult).catch(handleError)
        }}
      />
      
      <Button
        title="open directory picker"
        onPress={() => {
          DocumentPicker.pickDirectory().then(setResult).catch(handleError)
        }}
      />

      <Text selectable>Result: {JSON.stringify(result, null, 2)}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
})
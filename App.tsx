import * as React from 'react';
import { StyleSheet, View, Modal,Text, Button, ActivityIndicator,PermissionsAndroid, Alert } from 'react-native';
import DocumentPicker, {
  DirectoryPickerResponse,
  DocumentPickerResponse,
  isCancel,
  isInProgress,
  types,
} from 'react-native-document-picker';
import { useState, useEffect } from 'react';
import CameraScreen from './camera.tsx';
import SSHClient from '@dylankenneally/react-native-ssh-sftp';
import RNFS from 'react-native-fs';

export default function App() {
  const [showLoader,setShowLoader] = useState(false)
  const [loaderText,setLoaderText] = useState("")
  const [showCamera,setShowCamera] = useState(false)
  const [result, setResult] = useState<
    Array<DocumentPickerResponse> | DirectoryPickerResponse | undefined | null
  >();
  // useEffect(() => {
  //   console.log(JSON.stringify(result, null, 2));
  //   if (result) {
  //     uploadFiles(result);
  //   }
  // }, [result]);

  useEffect(()=>{
    requestStoragePermission()
  },[])

  useEffect(()=>{
    if(result)
    uploadFiles(result)
  },[result])
  
  const uploadFiles = async (files: any, ) => {
    try {
      setShowLoader(true)
      const client = await SSHClient.connectWithPassword(
        "77.92.187.10",
        22,
        "Finexsftptest",
        "Integration@2023"
      );
      let filesCount = 0
      for (const file of files) {
        const loadingText = "Files Uploading" + " "+ filesCount +' of '+files.length
        setLoaderText(loadingText)
        const destPath = `${RNFS.DocumentDirectoryPath}/${file.name}`;
        const sourcePath = file.uri;
        console.log(destPath,sourcePath)
        await RNFS.copyFile(sourcePath, destPath);
        await client.sftpUpload(destPath, "/C:/SFTPTest/");
        filesCount+=1
      }
      client.disconnect(); // Disconnect after uploading all files
      setResult(null)
      setLoaderText("")
      Alert.alert("Success","File upload Successfully")
      setShowLoader(false)
    } catch (error) {
      console.error('Error uploading files:', error);
    }
  };

  // const getFilesFromDirectory = async (directoryPath: string) => {
  //   try {
  //     const directoryItems = await RNFS.readdir(directoryPath);
  //     const files = [];
  //     for (const item of directoryItems) {
  //       const itemPath = `${directoryPath}/${item}`;
  //       const itemStats = await RNFS.stat(itemPath);
  //       if (itemStats.isFile()) {
  //         files.push(item);
  //       }
  //     }
  //     return files;
  //   } catch (error) {
  //     console.error('Error getting files from directory:', error);
  //     return [];
  //   }
  // };

  const requestStoragePermission = async () => {
    try {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.CAMERA,
      ]);
      if(granted){
        // getFilesFromScreenshotsFolder()
      }
    } catch (err) {
      console.warn('Error requesting storage permissions:', err);
    }
  };
  
  const handleError = (err: unknown) => {
    if (isCancel(err)) {
      console.warn('Cancelled');
      // User cancelled the picker, exit any dialogs or menus and move on
    } else if (isInProgress(err)) {
      console.warn('Multiple pickers were opened, only the last will be considered');
    } else {
      console.error('Error:', err);
    }
  };

  return (
    <View style={styles.container}>
      <View>
        <Text style={{color:'black', fontSize:16, fontWeight:600}}>Please select the files to upload to Server. </Text>
        <Text style={{color:'black', fontSize:16, marginBottom:20,fontWeight:600}}>You can long press on the file for multiple selection.</Text>
        <View style={{marginBottom:20}}>
          <Button
            title="New"
            onPress={() => {
              setShowCamera(true)
            }}
          />
        </View>
        <View style={{marginBottom:20}}>
          <Button
            title="Existing"
            onPress={() => {
              DocumentPicker.pick({ allowMultiSelection: true })
                .then((pickedFiles) => setResult(pickedFiles))
                .catch(handleError);
            }}
          />
      </View>
      </View>
      <Modal
        transparent
        visible={showLoader}>
        <View style={[styles.container,{backgroundColor:'rgba(0,0,0,0.75)'}]}>
          <ActivityIndicator size="large" color="blue"/>
          <Text style={{color:'white', fontSize:16, marginBottom:20,fontWeight:600}}>{loaderText}</Text>
        </View>
      </Modal>
      <Modal
        transparent
        visible={showCamera}>
        <CameraScreen onCapture={(uri:any)=>{ 
          const name = "cam-"+Date.now()
          setResult([{uri,name}])
          setShowCamera(false)
        }} closeModal={()=>setShowCamera(false)}/>
      </Modal>
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

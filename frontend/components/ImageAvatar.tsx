import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker'; // Expo ImagePicker használata fájlok választásához
import axios from 'axios'; // Axios importálása
import { useAuth } from '../AuthContext';
import { COLORS } from '../styles/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const styles = StyleSheet.create({
  container: {
    paddingTop: 0
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius:19,
    borderWidth:2,
    borderColor:COLORS.secondary.background
  }
});

interface DisplayAnImageProps {
  base64Image?: string | null; // Opcióként átadható base64 kép adat
  isEditable?: boolean; // Ha igaz, akkor a kép kattintható és fájlt választhatunk
}

const DisplayAnImage: React.FC<DisplayAnImageProps> = ({ base64Image = null, isEditable = false }) => {
  const [base64ImageState, setBase64ImageState] = useState(base64Image);  
  const { user, setUser, platformdata } = useAuth();  
  const devHost = platformdata.devHost;

  useEffect(() => {
    if (base64Image) {
      setBase64ImageState(base64Image);
    }
  }, [base64Image]); // Figyeli a base64Image változását

  const handleImagePick = async () => {
    if (!isEditable) return; // Ha nincs engedélyezve a szerkesztés, nem történik semmi

    // Fájl választás
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      const fileUri = result.assets[0].uri; // Kiválasztott fájl URI-ja
      uploadImage(fileUri); // Feltöltjük a fájlt a backend-re
    }
  };

  const uploadImage = async (uri: string) => {
    try {
      // Megnyitjuk a fájlt az uri alapján
      const response = await fetch(uri);
      const blob = await response.blob(); // A fájl Blob objektummá konvertálása

      // FormData
      const formData = new FormData();
      formData.append('image', blob, 'uploaded_image.jpg'); // Blob típusú adat küldése
      formData.append('category', 'avatar'); // Blob típusú adat küldése      
      formData.append('id_user', user.userId); // Blob típusú adat küldése    
      formData.append('session_user', user.sessionToken); // Blob típusú adat küldése    


      const config = {
        headers: {
          'Content-Type': 'multipart/form-data', // Meghatározzuk a megfelelő header-t
        },
      };

      const responseUpload = await axios.post(`http://${devHost}:8090/upload`, formData, config);

      if (responseUpload.status === 200) {
        Alert.alert('Success', 'Image uploaded successfully');
        setBase64ImageState(responseUpload.data.base64Image);
        const userData = user;
        userData.avatar = responseUpload.data.base64Image;
        await AsyncStorage.setItem('user', JSON.stringify(userData));   
      } else {
        Alert.alert('Error', 'Failed to upload image');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while uploading the image');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleImagePick} disabled={!isEditable}>
        <Image
          style={[styles.avatar, isEditable ? {} : { marginLeft: -8 }]}
          source={base64ImageState ? { uri: `data:image/jpeg;base64,${base64ImageState}` } : require('../assets/images/lustiq_user_avatar.jpg')}
        />
      </TouchableOpacity>
    </View>
  );
};

export default DisplayAnImage;

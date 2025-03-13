import React, { useState, useEffect, useCallback, use } from "react";
import { View, Text, Button, StyleSheet, Alert, TouchableOpacity} from "react-native";
import { useRouter } from "expo-router";
import {CameraView, useCameraPermissions} from 'expo-camera'
import {MaterialIcons} from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from "@react-navigation/native";

export default function Index() {
  const router = useRouter();
  const [facing, setFacing] = useState("back")
  const [permission, requestPermission] = useCameraPermissions()
  const [scanned, setScanned] = useState(false)
  const [qrData, setQrData] = useState('')
  const [qrList, setQrList] = useState([])
  
  const loadQrList = async () => {
    try {
      const storedQrList = await AsyncStorage.getItem('qrList');
      if (storedQrList) {
        setQrList(JSON.parse(storedQrList));
      }
    } catch (error) {
      console.error('Erro ao carregar qrList do AsyncStorage:', error);
    }
  };

  const saveQrList = async (list) => {
    try {
      await AsyncStorage.setItem('qrList', JSON.stringify(list)); 
    } catch (error) {
      console.error('Erro ao salvar qrList no AsyncStorage:', error);
    }
  };

  useFocusEffect(() => { 
    useCallback(() => {
      loadQrList();
    })
  }, []);

  useEffect(() => {
    saveQrList(qrList);
  }, [qrList]);
  

  if(!permission){
    return <View/>
  }

  if(!permission.granted){
    return (
        <View style={styles.container}> 
            <Text style={styles.message}> Precisamos da permissão para usar a câmera</Text>
            <Button onPress={requestPermission} title="Conceder permissão"></Button>
        </View>
    )
  }

  function toggleCameraFacing(){
    setFacing((atual) => (atual === 'back' ? 'front' : 'back'))
  }

  const handleCamera = ({data}) =>{
    setScanned(true)
    setQrData(data)
    setQrList((prevList) => [...prevList, { url: data, timestamp: new Date().toLocaleString() }])
    Alert.alert("QrCode escaneado", `Conteudo: ${data}`, [{text: "OK", onPress: () => console.log("OK")}])
  }

  const irParaHistorico = () => {
    console.log(qrList);
    router.push({
      pathname: "/historico",
      params: { qrList: JSON.stringify(qrList) },
    });
  };

  return (
  <View style={styles.container}>
    <CameraView style={styles.camera} facing={facing} barcodeScannerSettings={{barcodeTypes: ["qr"]}} onBarcodeScanned={ scanned ? undefined:handleCamera}></CameraView>
   
    <View style={styles.controles}>
        <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}> 
            <MaterialIcons name="flip-camera-ios" size={24} color="white" />
        </TouchableOpacity>
    
        {scanned && (
            <> 
                <TouchableOpacity style={styles.button} onPress ={() => setScanned(false)}> 
                    <MaterialIcons name="qr-code-scanner" size={24} color="white" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.button} onPress ={irParaHistorico}> 
                    <MaterialIcons name="list" size={24} color="white" />
                </TouchableOpacity>
            </>
        )}
    </View>
    <View style={styles.counterContainer}>
        <Text style={styles.counterText}>
            Total de QR Codes: {qrList.length}
        </Text>
    </View>

    {qrData !== '' &&(
        <View style={styles.result}>
            <Text style={styles.resultText}>{qrData}</Text>
        </View>
    )}
  </View>
  );
}

const styles = StyleSheet.create({
    counterContainer: {
        flex: 0.5,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "yellow",
      },
      counterText: {
        fontSize: 16,
        color: "#555",
      },
    camera:{
        flex: 10,
    },
    container: {
        flex: 1,
        backgroundColor: '#222'
    },
    text: {
        fontSize: 14,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',    
    },
    controles: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingVertical: 10,
    },

    button:{
        backgroundColor: '#6959CD',
        paddingVertical: 8,
        paddingHorizontal: 8,
        borderRadius: 5,
    },

    result:{
        flex: 0.5,
        backgroundColor: '#ccc',
        alignItems: 'center',
        flexDirection: 'column',
        justifyContent:'center',
    },
    resultText:{
        fontSize: 16,
    },
    message:{
        textAlign: 'center',
        paddingBottom: 10,
        color: 'white',
    },
});
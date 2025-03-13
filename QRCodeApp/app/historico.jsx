import React, { useState, useEffect } from "react";
import {View, Text, FlatList, StyleSheet, Linking, Button, TouchableOpacity} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";	
import { Share } from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Try } from "expo-router/build/views/Try";

export default function Historico() {
  const router = useRouter();
  const { qrList } = useLocalSearchParams();
  const [qrListArray, setQrListArray] = useState([]);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (qrList) {
        setQrListArray(JSON.parse(qrList));
    } else {
        setQrListArray([]);
    }
  }, [qrList]); 

  const limparHistorico = () => {
    setQrListArray([]);
    try{
      AsyncStorage.removeItem("qrList");
    } catch (error) {
      console.error('Erro ao limpar qrList do AsyncStorage:', error);
    }
  };

  const renderItem = async ({ item, index }) => {
    const {url} = item;
    const validURL = await Linking.canOpenURL(url);

    if(validURL){
      return(
        <View style={styles.listItem}> 
          <Text style={[styles.listText, {color: "blue", textDecorationLine: "underline"},]} onPress={() => Linking.openURL(url)} onLongPress={() => Share.share({message: url}) }> {url} </Text>
        </View>
      );
    }

    return(
      <View style={styles.listItem}>
        <Text style={styles.listText}> {`${index + 1}. ${item}`}</Text>
      </View>
    );
  };

  return(
    <View style={[styles.historyContainer, darkMode &&{backgroundColor: '#000', color: '#fff' },]}>
      <Text style={[styles.historyTitle, darkMode &&{backgroundColor: '#000', color: '#fff'}, ]}> Historico</Text>
      <FlatList data={qrListArray} renderItem={renderItem} keyExtractor={(item, index) => index.toString()} ListEmptyComponent={<Text>Nenhum qr code escaneado</Text>}></FlatList>
      <Button title="Limpar Histórico" onPress={limparHistorico} color="red" />
      <TouchableOpacity style={styles.button} onPress={() => setDarkMode(!darkMode)}>
        <MaterialIcons name={darkMode ? "wb-sunny" : "dark-mode"} size={24} color={darkMode ? "white" : "black"} />
      </TouchableOpacity>
</View>
  );
}

const styles = StyleSheet.create({
  historyContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  historyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  listItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  listText: {
    fontSize: 16,
  },
  button:{
    paddingVertical: 8,
    borderRadius: 5,
    paddingHorizontal: 5,
    margin: 'auto',
  },

});
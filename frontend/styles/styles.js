import { StyleSheet } from 'react-native';

const globalStyles = StyleSheet.create({
  body: {
    flex: 1,
    justifyContent: 'center', // Középre igazítja a container-t függőlegesen
    backgroundColor: '#FA2243',
  },    
  container: { 
    alignSelf: 'center',
    flex:1,
    width: '100%',
    maxWidth: 500,
    padding: 30,
  },
  button: {
    backgroundColor: '#ff5733',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  input: {
    borderColor: '#007BFF',
    borderWidth: 0,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: '#600F13',
    color: '#CF3E45',
    fontSize: 15,
    padding: 10, 
    marginBottom: 20
  },   
  text: {
    fontSize: 20,
    color: '#333',
  },
  colorWhite:{
    color:'white'
  },
  colorBlack:{
    color:'black'
  },
  colorPrimary:{
    color:'#600F13'
  },
  colorSecondary:{
    color:'#FE586A'
  },  
});

export default globalStyles;
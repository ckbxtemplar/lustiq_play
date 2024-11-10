import { StyleSheet } from 'react-native';
import { COLORS } from '../styles/constants';


const globalStyles = StyleSheet.create({
  body: {
    flex: 1,
    justifyContent: 'center', // Középre igazítja a container-t függőlegesen
    backgroundColor: COLORS.primary.background,
  },    
  bodyContainer:{
    flex:1,
    alignSelf:'center',
    width:'100%',
    maxWidth:500,
    padding:20
  },
  container: { 
    flex:1,    
    alignSelf: 'center',
    width: '100%',
  },
  loginContainer:{
    alignSelf: 'center',
    flex:1,
    width: '100%',
    maxWidth: 500,
    padding: 30,  
    backgroundColor:COLORS.secondary.background,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20     
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
    backgroundColor: COLORS.primary.background,
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
    color: COLORS.primary.text
  },
  colorSecondary:{
    color: COLORS.secondary.text
  },  
});

export default globalStyles;
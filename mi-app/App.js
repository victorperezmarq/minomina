import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  const [horasNormales, setHorasNormales] = useState('');
  const [precioHoraNormal, setPrecioHoraNormal] = useState('');
  const [horasComplementarias, setHorasComplementarias] = useState('');
  const [precioHoraComplementaria, setPrecioHoraComplementaria] = useState('');
  const [horasNocturnas, setHorasNocturnas] = useState('');
  const [precioHoraNocturna, setPrecioHoraNocturna] = useState('');
  const [complementos, setComplementos] = useState([]);
  const [nombreComplemento, setNombreComplemento] = useState('');
  const [cantidadComplemento, setCantidadComplemento] = useState('');
  const [total, setTotal] = useState(0);

  // Cargar datos guardados al inicio
  useEffect(() => {
    cargarDatos();
  }, []);

  // Guardar datos cuando cambian
  useEffect(() => {
    guardarDatos();
  }, [horasNormales, precioHoraNormal, horasComplementarias, precioHoraComplementaria, 
     horasNocturnas, precioHoraNocturna, complementos]);

  // Calcular total cuando cambian los valores
  useEffect(() => {
    calcularTotal();
  }, [horasNormales, precioHoraNormal, horasComplementarias, precioHoraComplementaria, 
     horasNocturnas, precioHoraNocturna, complementos]);

  const guardarDatos = async () => {
    try {
      const datos = {
        horasNormales,
        precioHoraNormal,
        horasComplementarias,
        precioHoraComplementaria,
        horasNocturnas,
        precioHoraNocturna,
        complementos
      };
      await AsyncStorage.setItem('datosSalario', JSON.stringify(datos));
    } catch (error) {
      Alert.alert('Error', 'No se pudieron guardar los datos');
    }
  };

  const cargarDatos = async () => {
    try {
      const datosGuardados = await AsyncStorage.getItem('datosSalario');
      if (datosGuardados) {
        const datos = JSON.parse(datosGuardados);
        setHorasNormales(datos.horasNormales || '');
        setPrecioHoraNormal(datos.precioHoraNormal || '');
        setHorasComplementarias(datos.horasComplementarias || '');
        setPrecioHoraComplementaria(datos.precioHoraComplementaria || '');
        setHorasNocturnas(datos.horasNocturnas || '');
        setPrecioHoraNocturna(datos.precioHoraNocturna || '');
        setComplementos(datos.complementos || []);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los datos');
    }
  };

  const calcularTotal = () => {
    // Convertir los valores a números y evitar NaN
    const hNorm = parseFloat(horasNormales) || 0;
    const pHNorm = parseFloat(precioHoraNormal) || 0;
    const hComp = parseFloat(horasComplementarias) || 0;
    const pHComp = parseFloat(precioHoraComplementaria) || 0;
    const hNoct = parseFloat(horasNocturnas) || 0;
    const pHNoct = parseFloat(precioHoraNocturna) || 0;
    
    // Calcular subtotales
    const totalNormal = hNorm * pHNorm;
    const totalComplementarias = hComp * pHComp;
    const totalNocturnas = hNoct * pHNoct;
    
    // Sumar complementos adicionales
    const totalComplementos = complementos.reduce((acc, comp) => {
      return acc + (parseFloat(comp.cantidad) || 0);
    }, 0);
    
    // Calcular total bruto
    const totalBruto = totalNormal + totalComplementarias + totalNocturnas + totalComplementos;
    
    setTotal(totalBruto);
  };

  const agregarComplemento = () => {
    if (nombreComplemento.trim() && cantidadComplemento.trim()) {
      const nuevoComplemento = {
        id: Date.now().toString(),
        nombre: nombreComplemento,
        cantidad: cantidadComplemento
      };
      setComplementos([...complementos, nuevoComplemento]);
      setNombreComplemento('');
      setCantidadComplemento('');
    } else {
      Alert.alert('Error', 'Debes ingresar nombre y cantidad');
    }
  };

  const eliminarComplemento = (id) => {
    setComplementos(complementos.filter(comp => comp.id !== id));
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Calculadora de Nómina</Text>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Horas Normales</Text>
        <View style={styles.row}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Número de horas:</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={horasNormales}
              onChangeText={setHorasNormales}
              placeholder="0"
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Precio por hora (€):</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={precioHoraNormal}
              onChangeText={setPrecioHoraNormal}
              placeholder="0"
            />
          </View>
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Horas Complementarias</Text>
        <View style={styles.row}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Número de horas:</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={horasComplementarias}
              onChangeText={setHorasComplementarias}
              placeholder="0"
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Precio extra (€):</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={precioHoraComplementaria}
              onChangeText={setPrecioHoraComplementaria}
              placeholder="0"
            />
          </View>
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Nocturnidad</Text>
        <View style={styles.row}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Número de horas:</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={horasNocturnas}
              onChangeText={setHorasNocturnas}
              placeholder="0"
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Precio extra (€):</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={precioHoraNocturna}
              onChangeText={setPrecioHoraNocturna}
              placeholder="0"
            />
          </View>
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Complementos Adicionales</Text>
        <View style={styles.row}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Nombre:</Text>
            <TextInput
              style={styles.input}
              value={nombreComplemento}
              onChangeText={setNombreComplemento}
              placeholder="Ej: Festivo"
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Cantidad (€):</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={cantidadComplemento}
              onChangeText={setCantidadComplemento}
              placeholder="0"
            />
          </View>
        </View>
        <TouchableOpacity style={styles.button} onPress={agregarComplemento}>
          <Text style={styles.buttonText}>Añadir Complemento</Text>
        </TouchableOpacity>
        
        {complementos.length > 0 && (
          <View style={styles.complementosList}>
            <Text style={styles.complementosTitle}>Complementos añadidos:</Text>
            {complementos.map(comp => (
              <View key={comp.id} style={styles.complementoItem}>
                <Text style={styles.complementoText}>{comp.nombre}: {comp.cantidad}€</Text>
                <TouchableOpacity 
                  style={styles.deleteButton} 
                  onPress={() => eliminarComplemento(comp.id)}
                >
                  <Text style={styles.deleteButtonText}>X</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </View>
      
      <View style={styles.resultSection}>
        <Text style={styles.resultTitle}>Total Bruto:</Text>
        <Text style={styles.resultAmount}>{total.toFixed(2)}€</Text>
      </View>
      
      <StatusBar style="auto" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: 50,
  },
  header: {
    backgroundColor: '#2c3e50',
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2c3e50',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  inputContainer: {
    width: '48%',
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    marginBottom: 5,
    color: '#666',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#3498db',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  complementosList: {
    marginTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  complementosTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  complementoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  complementoText: {
    fontSize: 16,
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  resultSection: {
    backgroundColor: '#2c3e50',
    borderRadius: 10,
    padding: 20,
    marginHorizontal: 15,
    marginBottom: 30,
    alignItems: 'center',
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  resultAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
  },
});

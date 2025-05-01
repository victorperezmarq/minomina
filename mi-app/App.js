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
  const [mostrarDetalleNomina, setMostrarDetalleNomina] = useState(false);
  const [datosNomina, setDatosNomina] = useState({
    contingenciasComunes: 0,
    desempleo: 0,
    formacion: 0,
    irpf: 0,
    totalDeducciones: 0,
    liquido: 0,
    aportacionEmpresa: 0
  });

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

  const calcularCotizacionesSociales = (salarioBruto) => {
    // Porcentajes de cotización para el trabajador
    const contingenciasComunes = salarioBruto * 0.047;
    const desempleo = salarioBruto * 0.0155;
    const formacion = salarioBruto * 0.001;
    
    // IRPF aproximado (varía según muchos factores)
    let porcentajeIRPF = 0;
    let irpf = 0;
    
    // Estimación del salario anual (multiplicamos por 12 asumiendo que es mensual)
    const salarioAnualEstimado = salarioBruto * 12;
    
    // Aplicar IRPF solo si supera el mínimo exento (aprox. 12.450€ anuales)
    if (salarioAnualEstimado > 12450) {
      // Estimación simple por tramos (esto es una aproximación)
      if (salarioAnualEstimado <= 20200) {
        porcentajeIRPF = 0.24;
      } else if (salarioAnualEstimado <= 35200) {
        porcentajeIRPF = 0.30;
      } else if (salarioAnualEstimado <= 60000) {
        porcentajeIRPF = 0.37;
      } else {
        porcentajeIRPF = 0.45;
      }
      
      irpf = salarioBruto * porcentajeIRPF;
    }
    
    // Total deducciones trabajador
    const totalDeducciones = contingenciasComunes + desempleo + formacion + irpf;
    
    // Salario líquido
    const liquido = salarioBruto - totalDeducciones;
    
    // Aportación de la empresa (aproximación)
    const contingenciasComunesEmpresa = salarioBruto * 0.236;
    const desempleoEmpresa = salarioBruto * 0.055;
    const fogasa = salarioBruto * 0.002;
    const formacionEmpresa = salarioBruto * 0.006;
    const accidentesTrabajoAprox = salarioBruto * 0.012; // Varía según sector
    
    const aportacionEmpresa = contingenciasComunesEmpresa + desempleoEmpresa + 
                              fogasa + formacionEmpresa + accidentesTrabajoAprox;
    
    return {
      contingenciasComunes,
      desempleo,
      formacion,
      irpf,
      totalDeducciones,
      liquido,
      aportacionEmpresa,
      // Desglose aportación empresa para mostrar detalle
      contingenciasComunesEmpresa,
      desempleoEmpresa,
      fogasa,
      formacionEmpresa,
      accidentesTrabajoAprox,
      // Añadimos información sobre exención de IRPF
      exentoIRPF: salarioAnualEstimado <= 12450
    };
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
    
    // Calcular cotizaciones
    const datosCotizaciones = calcularCotizacionesSociales(totalBruto);
    setDatosNomina(datosCotizaciones);
    
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

  const toggleDetalleNomina = () => {
    setMostrarDetalleNomina(!mostrarDetalleNomina);
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
        <TouchableOpacity style={styles.detalleButton} onPress={toggleDetalleNomina}>
          <Text style={styles.detalleButtonText}>
            {mostrarDetalleNomina ? "Ocultar Detalle" : "Ver Detalle Nómina"}
          </Text>
        </TouchableOpacity>
      </View>
      
      {mostrarDetalleNomina && (
        <View style={styles.detalleNomina}>
          <Text style={styles.detalleTitle}>Detalle de la Nómina</Text>
          
          <View style={styles.detalleSection}>
            <Text style={styles.detalleSectionTitle}>Retenciones del Trabajador</Text>
            <View style={styles.detalleRow}>
              <Text style={styles.detalleLabel}>Contingencias comunes (4.7%):</Text>
              <Text style={styles.detalleValue}>-{datosNomina.contingenciasComunes.toFixed(2)}€</Text>
            </View>
            <View style={styles.detalleRow}>
              <Text style={styles.detalleLabel}>Desempleo (1.55%):</Text>
              <Text style={styles.detalleValue}>-{datosNomina.desempleo.toFixed(2)}€</Text>
            </View>
            <View style={styles.detalleRow}>
              <Text style={styles.detalleLabel}>Formación profesional (0.1%):</Text>
              <Text style={styles.detalleValue}>-{datosNomina.formacion.toFixed(2)}€</Text>
            </View>
            <View style={styles.detalleRow}>
              <Text style={styles.detalleLabel}>IRPF:</Text>
              <Text style={styles.detalleValue}>
                {datosNomina.exentoIRPF 
                  ? "Exento (por debajo del mínimo)" 
                  : `-${datosNomina.irpf.toFixed(2)}€`}
              </Text>
            </View>
            <View style={styles.detalleTotalRow}>
              <Text style={styles.detalleTotalLabel}>Total deducciones:</Text>
              <Text style={styles.detalleTotalValue}>-{datosNomina.totalDeducciones.toFixed(2)}€</Text>
            </View>
          </View>
          
          <View style={styles.detalleLiquidoSection}>
            <Text style={styles.detalleLiquidoLabel}>Salario Líquido a Percibir:</Text>
            <Text style={styles.detalleLiquidoValue}>{datosNomina.liquido.toFixed(2)}€</Text>
          </View>
          
          <View style={styles.detalleSection}>
            <Text style={styles.detalleSectionTitle}>Aportación de la Empresa</Text>
            <View style={styles.detalleRow}>
              <Text style={styles.detalleLabel}>Contingencias comunes (23.6%):</Text>
              <Text style={styles.detalleValue}>{datosNomina.contingenciasComunesEmpresa.toFixed(2)}€</Text>
            </View>
            <View style={styles.detalleRow}>
              <Text style={styles.detalleLabel}>Desempleo (5.5%):</Text>
              <Text style={styles.detalleValue}>{datosNomina.desempleoEmpresa.toFixed(2)}€</Text>
            </View>
            <View style={styles.detalleRow}>
              <Text style={styles.detalleLabel}>FOGASA (0.2%):</Text>
              <Text style={styles.detalleValue}>{datosNomina.fogasa.toFixed(2)}€</Text>
            </View>
            <View style={styles.detalleRow}>
              <Text style={styles.detalleLabel}>Formación profesional (0.6%):</Text>
              <Text style={styles.detalleValue}>{datosNomina.formacionEmpresa.toFixed(2)}€</Text>
            </View>
            <View style={styles.detalleRow}>
              <Text style={styles.detalleLabel}>Accidentes de trabajo (aprox. 1.2%):</Text>
              <Text style={styles.detalleValue}>{datosNomina.accidentesTrabajoAprox.toFixed(2)}€</Text>
            </View>
            <View style={styles.detalleTotalRow}>
              <Text style={styles.detalleTotalLabel}>Total aportación empresa:</Text>
              <Text style={styles.detalleTotalValue}>{datosNomina.aportacionEmpresa.toFixed(2)}€</Text>
            </View>
          </View>
          
          <View style={styles.detalleCostoTotal}>
            <Text style={styles.detalleCostoTotalLabel}>Coste Total para la Empresa:</Text>
            <Text style={styles.detalleCostoTotalValue}>{(total + datosNomina.aportacionEmpresa).toFixed(2)}€</Text>
          </View>
        </View>
      )}
      
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
    marginBottom: 15,
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
    marginBottom: 15,
  },
  detalleButton: {
    backgroundColor: '#34495e',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  detalleButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  detalleNomina: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 15,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  detalleTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
    textAlign: 'center',
  },
  detalleSection: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10,
  },
  detalleSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  detalleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  detalleLabel: {
    fontSize: 14,
    color: '#666',
  },
  detalleValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  detalleTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    marginTop: 5,
  },
  detalleTotalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  detalleTotalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  detalleLiquidoSection: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  detalleLiquidoLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  detalleLiquidoValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  detalleCostoTotal: {
    backgroundColor: '#2c3e50',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  detalleCostoTotalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  detalleCostoTotalValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  }
});

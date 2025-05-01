import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert, Modal } from 'react-native';
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
  
  // Nuevos estados para el registro de horarios
  const [registrosHorarios, setRegistrosHorarios] = useState([]);
  const [modalRegistroVisible, setModalRegistroVisible] = useState(false);
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
  const [horaEntrada, setHoraEntrada] = useState('');
  const [horaSalida, setHoraSalida] = useState('');
  const [descanso, setDescanso] = useState('');
  const [esHoraExtra, setEsHoraExtra] = useState(false);
  const [esNocturna, setEsNocturna] = useState(false);
  const [mesActual, setMesActual] = useState(new Date().getMonth());
  const [anoActual, setAnoActual] = useState(new Date().getFullYear());
  const [modalCalendarioVisible, setModalCalendarioVisible] = useState(false);

  // Cargar datos guardados al inicio
  useEffect(() => {
    cargarDatos();
    cargarRegistrosHorarios();
  }, []);

  // Guardar datos cuando cambian
  useEffect(() => {
    guardarDatos();
  }, [horasNormales, precioHoraNormal, horasComplementarias, precioHoraComplementaria, 
     horasNocturnas, precioHoraNocturna, complementos]);

  // Guardar registros horarios cuando cambian
  useEffect(() => {
    guardarRegistrosHorarios();
  }, [registrosHorarios]);

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

  const guardarRegistrosHorarios = async () => {
    try {
      await AsyncStorage.setItem('registrosHorarios', JSON.stringify(registrosHorarios));
    } catch (error) {
      Alert.alert('Error', 'No se pudieron guardar los registros horarios');
    }
  };

  const cargarRegistrosHorarios = async () => {
    try {
      const registrosGuardados = await AsyncStorage.getItem('registrosHorarios');
      if (registrosGuardados) {
        setRegistrosHorarios(JSON.parse(registrosGuardados));
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los registros horarios');
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

  const calcularHorasTrabajadas = () => {
    if (!horaEntrada || !horaSalida) return 0;

    const [horaEntradaHora, horaEntradaMinuto] = horaEntrada.split(':').map(num => parseInt(num, 10));
    const [horaSalidaHora, horaSalidaMinuto] = horaSalida.split(':').map(num => parseInt(num, 10));
    
    let minutosEntrada = horaEntradaHora * 60 + horaEntradaMinuto;
    let minutosSalida = horaSalidaHora * 60 + horaSalidaMinuto;
    
    // Si la salida es del día siguiente
    if (minutosSalida < minutosEntrada) {
      minutosSalida += 24 * 60;
    }
    
    // Restar el descanso si existe
    const minutosDescanso = descanso ? parseInt(descanso, 10) : 0;
    
    const minutosTrabajados = minutosSalida - minutosEntrada - minutosDescanso;
    return (minutosTrabajados / 60).toFixed(2);
  };

  const agregarRegistroHorario = () => {
    if (!horaEntrada || !horaSalida) {
      Alert.alert('Error', 'Debes introducir hora de entrada y salida');
      return;
    }

    const horasTrabajadas = calcularHorasTrabajadas();
    
    const nuevoRegistro = {
      id: Date.now().toString(),
      fecha: fechaSeleccionada.toISOString(),
      horaEntrada,
      horaSalida,
      descanso: descanso || '0',
      horasTrabajadas,
      esHoraExtra,
      esNocturna
    };
    
    setRegistrosHorarios([...registrosHorarios, nuevoRegistro]);
    
    // Actualizar los totales automáticamente - Corregido para evitar error de toString()
    if (esHoraExtra) {
      const valorActual = parseFloat(horasComplementarias) || 0;
      const nuevoValor = valorActual + parseFloat(horasTrabajadas);
      setHorasComplementarias(nuevoValor.toString());
    } else if (esNocturna) {
      const valorActual = parseFloat(horasNocturnas) || 0;
      const nuevoValor = valorActual + parseFloat(horasTrabajadas);
      setHorasNocturnas(nuevoValor.toString());
    } else {
      const valorActual = parseFloat(horasNormales) || 0;
      const nuevoValor = valorActual + parseFloat(horasTrabajadas);
      setHorasNormales(nuevoValor.toString());
    }
    
    setModalRegistroVisible(false);
    limpiarFormularioRegistro();
  };

  const limpiarFormularioRegistro = () => {
    setHoraEntrada('');
    setHoraSalida('');
    setDescanso('');
    setEsHoraExtra(false);
    setEsNocturna(false);
  };

  const eliminarRegistroHorario = (id) => {
    const registro = registrosHorarios.find(reg => reg.id === id);
    if (registro) {
      // Restar las horas del total correspondiente - Corregido para evitar error de toString()
      if (registro.esHoraExtra) {
        const valorActual = parseFloat(horasComplementarias) || 0;
        const nuevoValor = valorActual - parseFloat(registro.horasTrabajadas);
        setHorasComplementarias(nuevoValor.toString());
      } else if (registro.esNocturna) {
        const valorActual = parseFloat(horasNocturnas) || 0;
        const nuevoValor = valorActual - parseFloat(registro.horasTrabajadas);
        setHorasNocturnas(nuevoValor.toString());
      } else {
        const valorActual = parseFloat(horasNormales) || 0;
        const nuevoValor = valorActual - parseFloat(registro.horasTrabajadas);
        setHorasNormales(nuevoValor.toString());
      }
    }
    
    setRegistrosHorarios(registrosHorarios.filter(reg => reg.id !== id));
  };

  const seleccionarDia = (dia) => {
    const nuevaFecha = new Date(anoActual, mesActual, dia);
    setFechaSeleccionada(nuevaFecha);
    setModalCalendarioVisible(false);
    setModalRegistroVisible(true);
  };

  const cambiarMes = (incremento) => {
    let nuevoMes = mesActual + incremento;
    let nuevoAno = anoActual;
    
    if (nuevoMes > 11) {
      nuevoMes = 0;
      nuevoAno += 1;
    } else if (nuevoMes < 0) {
      nuevoMes = 11;
      nuevoAno -= 1;
    }
    
    setMesActual(nuevoMes);
    setAnoActual(nuevoAno);
  };

  const obtenerNombreMes = (mes) => {
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return meses[mes];
  };

  const generarDiasDelMes = () => {
    const ultimoDia = new Date(anoActual, mesActual + 1, 0).getDate();
    const dias = [];
    
    for (let i = 1; i <= ultimoDia; i++) {
      dias.push(i);
    }
    
    return dias;
  };

  const filtrarRegistrosPorMes = () => {
    return registrosHorarios.filter(registro => {
      const fecha = new Date(registro.fecha);
      return fecha.getMonth() === mesActual && fecha.getFullYear() === anoActual;
    });
  };

  const toggleDetalleNomina = () => {
    setMostrarDetalleNomina(!mostrarDetalleNomina);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Calculadora de Nómina</Text>
      </View>
      
      {/* Sección de Registro de Horarios */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Registro de Horarios</Text>
        <TouchableOpacity style={styles.button} onPress={() => setModalCalendarioVisible(true)}>
          <Text style={styles.buttonText}>Añadir Horario</Text>
        </TouchableOpacity>
        
        {filtrarRegistrosPorMes().length > 0 && (
          <View style={styles.registrosContainer}>
            <Text style={styles.registrosTitle}>Horarios de {obtenerNombreMes(mesActual)} {anoActual}:</Text>
            {filtrarRegistrosPorMes().map(registro => {
              const fecha = new Date(registro.fecha);
              return (
                <View key={registro.id} style={styles.registroItem}>
                  <View style={styles.registroInfo}>
                    <Text style={styles.registroFecha}>{fecha.getDate()} de {obtenerNombreMes(fecha.getMonth())}</Text>
                    <Text style={styles.registroHorario}>
                      {registro.horaEntrada} - {registro.horaSalida} 
                      {registro.descanso !== '0' ? ` (Descanso: ${registro.descanso} min)` : ''}
                    </Text>
                    <Text style={styles.registroHoras}>
                      {registro.horasTrabajadas} horas
                      {registro.esHoraExtra ? ' (Extra)' : ''}
                      {registro.esNocturna ? ' (Nocturna)' : ''}
                    </Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.deleteButton} 
                    onPress={() => eliminarRegistroHorario(registro.id)}
                  >
                    <Text style={styles.deleteButtonText}>X</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}
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
      
      {/* Modal de selección de calendario */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalCalendarioVisible}
        onRequestClose={() => setModalCalendarioVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Selecciona una fecha</Text>
            
            <View style={styles.calendarHeader}>
              <TouchableOpacity onPress={() => cambiarMes(-1)}>
                <Text style={styles.calendarNavButton}>{'<'}</Text>
              </TouchableOpacity>
              <Text style={styles.calendarTitle}>{obtenerNombreMes(mesActual)} {anoActual}</Text>
              <TouchableOpacity onPress={() => cambiarMes(1)}>
                <Text style={styles.calendarNavButton}>{'>'}</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.calendarDays}>
              {generarDiasDelMes().map(dia => (
                <TouchableOpacity 
                  key={dia} 
                  style={styles.calendarDay}
                  onPress={() => seleccionarDia(dia)}
                >
                  <Text style={styles.calendarDayText}>{dia}</Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <TouchableOpacity
              style={styles.button}
              onPress={() => setModalCalendarioVisible(false)}
            >
              <Text style={styles.buttonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      {/* Modal de registro de horario */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalRegistroVisible}
        onRequestClose={() => setModalRegistroVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>
              Registro para el {fechaSeleccionada.getDate()} de {obtenerNombreMes(fechaSeleccionada.getMonth())}
            </Text>
            
            <View style={styles.modalInputRow}>
              <Text style={styles.modalInputLabel}>Hora de entrada:</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="HH:MM"
                value={horaEntrada}
                onChangeText={setHoraEntrada}
                keyboardType="numbers-and-punctuation"
              />
            </View>
            
            <View style={styles.modalInputRow}>
              <Text style={styles.modalInputLabel}>Hora de salida:</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="HH:MM"
                value={horaSalida}
                onChangeText={setHoraSalida}
                keyboardType="numbers-and-punctuation"
              />
            </View>
            
            <View style={styles.modalInputRow}>
              <Text style={styles.modalInputLabel}>Descanso (minutos):</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="0"
                value={descanso}
                onChangeText={setDescanso}
                keyboardType="numeric"
              />
            </View>
            
            {horaEntrada && horaSalida && (
              <View style={styles.horasCalculadas}>
                <Text style={styles.horasCalculadasLabel}>Horas totales:</Text>
                <Text style={styles.horasCalculadasValue}>{calcularHorasTrabajadas()} h</Text>
              </View>
            )}
            
            <View style={styles.checkboxRow}>
              <TouchableOpacity 
                style={[styles.checkbox, esHoraExtra && styles.checkboxChecked]} 
                onPress={() => setEsHoraExtra(!esHoraExtra)}
              />
              <Text style={styles.checkboxLabel}>Es hora extra</Text>
            </View>
            
            <View style={styles.checkboxRow}>
              <TouchableOpacity 
                style={[styles.checkbox, esNocturna && styles.checkboxChecked]} 
                onPress={() => setEsNocturna(!esNocturna)}
              />
              <Text style={styles.checkboxLabel}>Es hora nocturna</Text>
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.buttonCancel]}
                onPress={() => setModalRegistroVisible(false)}
              >
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.button, styles.buttonSave]}
                onPress={agregarRegistroHorario}
              >
                <Text style={styles.buttonText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
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
  },
  registrosContainer: {
    marginTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  registrosTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  registroItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  registroInfo: {
    flex: 1,
  },
  registroFecha: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  registroHorario: {
    fontSize: 14,
    color: '#666',
  },
  registroHoras: {
    fontSize: 14,
    fontWeight: '500',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  calendarNavButton: {
    fontSize: 24,
    padding: 5,
  },
  calendarDays: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  calendarDay: {
    width: '13%',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
  calendarDayText: {
    fontSize: 16,
  },
  modalInputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalInputLabel: {
    fontSize: 16,
    width: '40%',
  },
  modalInput: {
    width: '60%',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 16,
  },
  horasCalculadas: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 15,
    paddingVertical: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  horasCalculadasLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  horasCalculadasValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 3,
    marginRight: 10,
  },
  checkboxChecked: {
    backgroundColor: '#3498db',
  },
  checkboxLabel: {
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  buttonCancel: {
    backgroundColor: '#e74c3c',
    width: '48%',
  },
  buttonSave: {
    backgroundColor: '#2ecc71',
    width: '48%',
  },
});

import React, { useState, useEffect } from "react";
import axios from "axios";
import API_BASE_URL from './apiConfig';
import "bootstrap/dist/css/bootstrap.min.css";

const HotelList = () => {
  const [hotels, setHotels] = useState([]);
  const [habitacionTipos, setHabitacionTipos] = useState([]);
  const [acomodacionTipo, setAcomodacionTipo] = useState([]);
  const [showForm, setShowForm] = useState(false); // Para mostrar u ocultar el formulario
  const [error, setError] = useState("");
  const [totalHabitaciones, setTotalHabitaciones] = useState(0);
  const [nuevoHotel, setNuevoHotel] = useState({
    habitacionTipos: [],
  });

   // Cargar datos desde la API
   useEffect(() => {
    axios.get(`${API_BASE_URL}/tipo_habitacion`)
      .then(response => setHabitacionTipos(response.data) )      
      .catch(error => console.error("Error:", error));

    axios.get(`${API_BASE_URL}/acomodacion`)
      .then(response => setAcomodacionTipo(response.data))
      .catch(error => console.error("Error:", error));
  }, []);

  // Verificar el tipo  de habitacion
  const handleType = (index, field, value) => {
    const updatedHabitacionTipos = [...nuevoHotel.habitacionTipos];
    updatedHabitacionTipos[index][field] = value;
    setNuevoHotel({ ...nuevoHotel, habitacionTipos: updatedHabitacionTipos });
  };
  
  useEffect(() => {
    fetchHotels();
  }, []);

  // Cargar los hoteles que ya estan en la bd
  const fetchHotels = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/hotels`);
      setHotels(response.data);
    } catch (error) {
      console.error("Error al cargar los hoteles:", error);
    }
  };

  // Asignar numero de habitacions y luego asignar un total 
  const handleCombinedChange = (e) => {
    handleInputChange(e);
    handleTotalHabitacionesChange(e);    
  };

  // Asignar valores a cada item
  const handleInputChange = (e) => {    
    setNuevoHotel({
      ...nuevoHotel,
      [e.target.name]: e.target.value,
    });
  };

  // adcionar varios tipos de habitacion
  const addRoomType = () => {
    setNuevoHotel({
      ...nuevoHotel,
      habitacionTipos: [
        ...nuevoHotel.habitacionTipos,
        { tipo: "", acomodacion: "", cantidad: 0 },
      ],
    });
  };

  // Eliminar el tipo de la habitacion
  const removeRoomType = (index) => {
    const updatedHabitacionTipos = nuevoHotel.habitacionTipos.filter((_, i) => i !== index);
    setNuevoHotel({ ...nuevoHotel, habitacionTipos: updatedHabitacionTipos });
  };
 
  // Validacion de las habitaciones
  const validateHabitacion = (e) => {        
      // Asegurarnos de convertir todas las cantidades a números antes de sumarlas
    const totalSelectedHabitaciones = nuevoHotel.habitacionTipos.reduce((sum, habitacion) => {
        const cantidadNumero = Number(habitacion.cantidad) || 0; // Convertir a número y manejar valores no válidos
        return sum + cantidadNumero;
    }, 0);
    return totalSelectedHabitaciones === totalHabitaciones; // Comparar con el total de habitaciones

  };

  // Asignar valores total de habitaciones
  const handleTotalHabitacionesChange = (e) => {
    setTotalHabitaciones(Number(e.target.value));
  };

  // Validacion de la acomodacion 
  const validarAcomodacion = (tipo, acomodacion) => {
    console.log(tipo, acomodacion)
    const regla = {
      "Estandar": ["Sencilla", "Doble"],
      "Junior": ["Triple", "Cuadruple"],
      "Suite": ["Sencilla", "Doble", "Triple"]
    };
    return regla[tipo]?.includes(acomodacion) || false;
  };

  // Boton de adicionar hotel 
  const addHotel = async (e) => {
    e.preventDefault();
      // valida acomodacion
      const isValid = nuevoHotel.habitacionTipos.every(habitacion =>        
        validarAcomodacion(habitacion.tipo,habitacion.acomodacion)
      );

      if (!isValid) {
        alert("Algunas acomodaciones no son válidas para el tipo de habitacion seleccionado.");
        return;
      }
     // Mensaje la cantidad de habitaciones para que coincida
     
     if (!validateHabitacion()) {
      setError(
        "La suma de las cantidades de habitaciones debe coincidir con el numero total de habitaciones."
      );
      return;
    }
    /*
    // Mensaje si no coincie
    if (!validarAcomodacion()) {
      setError(
        "Una o mas acomodaciones no son validas para los tipos de habitacion seleccionados."
      );
      return;
    }*/

    setError(""); // Limpia errores si la validación pasa
    try {
      // Envia la info para guardar   
      await axios.post(`${API_BASE_URL}/hotels`, nuevoHotel);
      setShowForm(false);
      fetchHotels(); // Actualiza la lista de hoteles
      alert("Registrado con exito")
    } catch (error) {
       alert(error.response.data.message )
       console.error("Error al agregar el hotel:", error);
    }
  };

  return (
    <div className="container mt-6">
      <h1 className="text-center mb-4">Lista de Hoteles</h1>
      <button
        className="btn btn-primary mb-4"
        onClick={() => setShowForm(!showForm)}
      >
        {showForm ? "Cancelar" : "Agregar Hotel"}
      </button>

      {showForm && (
        <form onSubmit={addHotel} className="mb-4">
          <div className="row g-3">
            <div className="col-md-4">
              <label>Nombre del hotel</label>
              <input
                type="text"
                name="nombre"
                placeholder="Digite el nombre del hotel"
                className="form-control"
                value={nuevoHotel.nombre}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="col-md-4">
              <label>Dirección</label>
              <input
                type="text"
                name="direccion"
                placeholder="Digite la dirección"
                className="form-control"
                value={nuevoHotel.direccion}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="col-md-4">
              <label>Ciudad</label>  
              <input
                type="text"
                name="ciudad"
                placeholder="Digite la ciudad"
                className="form-control"
                value={nuevoHotel.ciudad}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="col-md-4">
            <label>NIT</label>  
              <input
                type="number"
                name="nit"
                placeholder="Digite el NIT"
                className="form-control"
                value={nuevoHotel.nit}
                onChange={handleInputChange}
                min="0"
                required
              />
            </div>
            <div className="col-md-4">
              <label>Numero de habitaciones</label>  
              <input
                type="number"
                name="numero_habitaciones"
                placeholder="Digite el Número de Habitaciones"
                className="form-control"
                value={nuevoHotel.numero_habitaciones}
                onChange={handleCombinedChange}
                min="0"
                required
              />
            </div>
          </div>

          <spam className="text-left"> <h4 className="mt-4">Tipos de Habitación</h4></spam>
          {nuevoHotel.habitacionTipos.map((habitacion, index) => (
            <div key={index} className="row g-3 align-items-center mb-3">
                <div className="col-md-4">
                    <div className="form-group">
                        <label>Tipo de Habitación</label>
                        <select
                            value={habitacion.tipo}
                            name={`tipo_habitacion_id-${index}`}
                            onChange={(e) =>                                 
                                handleType(index,"tipo",e.target.value)}
                            className="form-select"
                        >
                            <option value="">Seleccione un tipo</option>
                            {habitacionTipos.map((tipo) => (
                            <option key={tipo.id} value={tipo.nombre}>
                                {tipo.nombre}
                            </option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="form-group">
                        <label>Acomodación</label>
                        <select
                            value={habitacion.acomodacion}
                            name={`acomodacion_id-${index}`}                            
                            onChange={(e) => handleType(index,"acomodacion",e.target.value)}
                            className="form-select"
                            >
                            <option value="">Seleccione una acomodación</option>
                            {acomodacionTipo.map((acomodacion) => (
                            <option key={acomodacion.id} value={acomodacion.nombre}>
                                {acomodacion.nombre}
                            </option>
                            ))}
                        </select>
                    </div>
                </div>
              <div className="col-md-2">
                <label>Cantidad</label> 
                <input
                  type="number"
                  name={`cantidad-${index}`}        
                  className="form-control"                    
                  onChange={(e) => handleType(index,"cantidad",e.target.value)}         
                  placeholder="Cantidad"
                  min="0"
                  required
                />
              </div>
              <div className="col-md-2">
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => removeRoomType(index)}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            className="btn btn-secondary "
            onClick={addRoomType}
          >
            Añadir Tipo de Habitación
          </button>
          <br></br><br></br><br></br>
          <button type="submit" className="btn btn-success col-lg-6">
            Guardar Hotel
          </button>
          <br></br><br></br>
          {error && <div className="alert alert-danger">{error}</div>}
        </form>
      )}

      <table className="table table-striped">
        <thead>
          <tr>
            <th>#</th>
            <th>Nombre</th>
            <th>Dirección</th>
            <th>Ciudad</th>
            <th>NIT</th>
            <th>Habitaciones</th>
          </tr>
        </thead>
        <tbody>
          {hotels.map((hotel, index) => (
            <tr key={hotel.id}>
                <td>{index + 1}</td>
                <td>{hotel.nombre}</td>
                <td>{hotel.direccion}</td>
                <td>{hotel.ciudad}</td>
                <td>{hotel.nit}</td>
                <td>{hotel.numero_habitaciones}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default HotelList;

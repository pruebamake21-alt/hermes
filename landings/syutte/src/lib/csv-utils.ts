/**
 * CSV column mapping and value conversion utilities.
 * Shared between normal import and smart import.
 */

export const columnMapping: Record<string, string> = {
  titulo: "title", título: "title", title: "title",
  descripcion: "description", descripción: "description", description: "description",
  precio: "price", price: "price",
  tipo_operacion: "operationType", tipo_operación: "operationType", operation_type: "operationType", operationtype: "operationType",
  tipo_inmueble: "propertyType", property_type: "propertyType", propertytype: "propertyType",
  moneda: "currency", currency: "currency",
  estado: "status", status: "status",
  metros_utiles: "usableSurface", metros_útiles: "usableSurface", usable_surface: "usableSurface", m2_utiles: "usableSurface",
  metros_construidos: "builtSurface", built_surface: "builtSurface", m2_construidos: "builtSurface",
  habitaciones: "bedrooms", dormitorios: "bedrooms", bedrooms: "bedrooms",
  banos: "bathrooms", baños: "bathrooms", bathrooms: "bathrooms",
  aseos: "toilets", toilets: "toilets",
  planta: "floor", floor: "floor",
  ascensor: "hasElevator", has_elevator: "hasElevator",
  terraza: "terrace", terrace: "terrace",
  balcon: "balcony", balcony: "balcony",
  garaje: "garage", garage: "garage",
  trastero: "storageRoom", storage_room: "storageRoom",
  piscina: "pool", pool: "pool",
  aire_acondicionado: "airConditioning", air_conditioning: "airConditioning",
  calefaccion: "heating", calefacción: "heating", heating: "heating",
  certificado: "energyCert", energy_cert: "energyCert", energycert: "energyCert",
  direccion: "address", dirección: "address", address: "address",
  ciudad: "city", city: "city",
  latitud: "latitude", lat: "latitude",
  longitud: "longitude", lng: "longitude", lon: "longitude",
  zona: "zone", barrio: "zone", neighborhood: "zone",
};

export function mapValue(field: string, value: string): any {
  if (!value || value.trim() === "") return null;

  const cleaned = value.trim();

  switch (field) {
    case "price":
    case "usableSurface":
    case "builtSurface":
      return parseFloat(cleaned.replace(/[€$.\s]/g, "").replace(",", ".")) || null;
    case "bedrooms":
    case "bathrooms":
    case "toilets":
      return parseInt(cleaned) || null;
    case "hasElevator":
    case "terrace":
    case "balcony":
    case "garage":
    case "storageRoom":
    case "pool":
    case "airConditioning":
    case "heating":
    case "hideExactAddress":
      return ["si", "yes", "1", "true", "sí", "on"].includes(cleaned.toLowerCase());
    case "operationType": {
      const v = cleaned.toLowerCase();
      if (v.includes("venta") || v.includes("compra") || v.includes("sale")) return "VENTA";
      if (v.includes("alquiler") || v.includes("rent") || v.includes("lease")) return "ALQUILER";
      if (v.includes("vacacional") || v.includes("vacation") || v.includes("temporada")) return "ALQUILER_VACACIONAL";
      return cleaned.toUpperCase();
    }
    case "propertyType": {
      const v = cleaned.toLowerCase();
      if (v.includes("piso") || v.includes("apart") || v.includes("flat")) return "PISO";
      if (v.includes("casa") || v.includes("house") || v.includes("villa") || v.includes("chalet")) return "CASA";
      if (v.includes("local") || v.includes("comercial") || v.includes("commercial")) return "LOCAL";
      if (v.includes("oficina") || v.includes("office")) return "OFICINA";
      if (v.includes("terreno") || v.includes("land") || v.includes("plot")) return "TERRENO";
      return cleaned.toUpperCase();
    }
    default:
      return cleaned;
  }
}

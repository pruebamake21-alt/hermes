"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createProperty } from "@/lib/actions/property";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export function PropertyForm({ defaultValues }: { defaultValues?: any }) {
  const router = useRouter();
  const isEditing = !!defaultValues;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      if (isEditing) {
        const { updateProperty } = await import("@/lib/actions/property");
        await updateProperty(defaultValues.id, formData);
        toast.success("Inmueble actualizado correctamente");
      } else {
        await createProperty(formData);
        toast.success("Inmueble creado correctamente");
      }
      router.push("/dashboard/properties");
      router.refresh();
    } catch (error) {
      console.error("Error saving property:", error);
      toast.error("Error al guardar el inmueble");
    }
  }

  function LabelField({ label, required }: { label: string; required?: boolean }) {
    return (
      <Label>
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </Label>
    );
  }

  function InputField({ label, name, type = "text", required, placeholder }: any) {
    return (
      <div>
        <LabelField label={label} required={required} />
        <Input
          id={name}
          name={name}
          type={type}
          required={required}
          placeholder={placeholder}
          defaultValue={defaultValues?.[name] ?? ""}
          step={type === "number" ? "any" : undefined}
        />
      </div>
    );
  }

  function SelectField({ label, name, options, required }: any) {
    return (
      <div>
        <LabelField label={label} required={required} />
        <select
          id={name}
          name={name}
          required={required}
          defaultValue={defaultValues?.[name] ?? ""}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">Seleccionar...</option>
          {options.map((opt: any) => (
            <option key={typeof opt === "string" ? opt : opt.value} value={typeof opt === "string" ? opt : opt.value}>
              {typeof opt === "string" ? opt : opt.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  function CheckboxField({ label, name }: any) {
    return (
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name={name}
          defaultChecked={defaultValues?.[name] ?? false}
          className="h-4 w-4 rounded border-gray-300"
        />
        {label}
      </label>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Información básica */}
      <Card>
        <CardHeader>
          <CardTitle>Información Básica</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <SelectField
            label="Tipo de operación"
            name="operationType"
            required
            options={[
              { value: "VENTA", label: "Venta" },
              { value: "ALQUILER", label: "Alquiler" },
              { value: "ALQUILER_VACACIONAL", label: "Alquiler vacacional" },
            ]}
          />
          <SelectField
            label="Tipo de inmueble"
            name="propertyType"
            required
            options={[
              { value: "PISO", label: "Piso" },
              { value: "CASA", label: "Casa" },
              { value: "LOCAL", label: "Local" },
              { value: "OFICINA", label: "Oficina" },
              { value: "TERRENO", label: "Terreno" },
            ]}
          />
          <InputField label="Precio" name="price" type="number" required placeholder="350000" />
          <SelectField
            label="Moneda"
            name="currency"
            options={[
              { value: "EUR", label: "EUR (€)" },
              { value: "USD", label: "USD ($)" },
            ]}
          />
          <SelectField
            label="Estado"
            name="status"
            options={[
              { value: "DISPONIBLE", label: "Disponible" },
              { value: "RESERVADO", label: "Reservado" },
              { value: "VENDIDO", label: "Vendido" },
              { value: "ALQUILADO", label: "Alquilado" },
            ]}
          />
          <InputField label="Título comercial" name="title" placeholder="Luminoso ático con vistas" />
        </CardContent>
      </Card>

      {/* Características físicas */}
      <Card>
        <CardHeader>
          <CardTitle>Características Físicas</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <InputField label="Metros útiles" name="usableSurface" type="number" placeholder="85" />
          <InputField label="Metros construidos" name="builtSurface" type="number" placeholder="95" />
          <InputField label="Habitaciones" name="bedrooms" type="number" placeholder="3" />
          <InputField label="Baños" name="bathrooms" type="number" placeholder="2" />
          <InputField label="Aseos" name="toilets" type="number" placeholder="1" />
          <InputField label="Planta" name="floor" placeholder="3ª" />
          <SelectField
            label="Certificado energético"
            name="energyCert"
            options={["A", "B", "C", "D", "E", "F", "G"]}
          />
          <div />
          <div className="grid grid-cols-2 gap-2 sm:col-span-2">
            <CheckboxField label="Ascensor" name="hasElevator" />
            <CheckboxField label="Terraza" name="terrace" />
            <CheckboxField label="Balcón" name="balcony" />
            <CheckboxField label="Garaje" name="garage" />
            <CheckboxField label="Trastero" name="storageRoom" />
            <CheckboxField label="Piscina" name="pool" />
            <CheckboxField label="Aire acondicionado" name="airConditioning" />
            <CheckboxField label="Calefacción" name="heating" />
          </div>
        </CardContent>
      </Card>

      {/* Ubicación */}
      <Card>
        <CardHeader>
          <CardTitle>Ubicación</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <InputField label="Dirección" name="address" placeholder="Calle del Mar 42, 08001 Barcelona" />
          <InputField label="Ciudad" name="city" placeholder="Barcelona" />
          <InputField label="Zona / Barrio" name="zone" placeholder="Centro" />
          <InputField label="Latitud" name="latitude" type="number" placeholder="41.3874" />
          <InputField label="Longitud" name="longitude" type="number" placeholder="2.1686" />
          <div className="flex items-center pt-2">
            <CheckboxField label="Ocultar dirección exacta en web" name="hideExactAddress" />
          </div>
        </CardContent>
      </Card>

      {/* Descripción */}
      <Card>
        <CardHeader>
          <CardTitle>Descripción</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="description">Descripción detallada</Label>
            <textarea
              id="description"
              name="description"
              rows={4}
              defaultValue={defaultValues?.description ?? ""}
              placeholder="Describe el inmueble en detalle..."
              className="mt-1 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button type="submit">{isEditing ? "Guardar cambios" : "Crear Inmueble"}</Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/dashboard/properties")}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}

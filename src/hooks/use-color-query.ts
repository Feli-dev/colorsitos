import { isValidHex } from "@/utils/color-utils";
import { useQueryState } from "nuqs";

/**
 * Hook personalizado para manejar el query param 'color'
 * Permite leer y actualizar el color seleccionado desde la URL
 *
 * @returns Un array con [color, setColor] similar a useState
 */
export function useColorQuery() {
  const [color, setColor] = useQueryState("color", {
    defaultValue: "",
    parse: (value: string) => {
      // Validar que sea un color hex válido
      if (!value) return "";
      const normalized = value.startsWith("#") ? value : `#${value}`;
      return isValidHex(normalized) ? normalized : "";
    },
    serialize: (value: string) => {
      // Remover el # si existe para la URL
      return value.startsWith("#") ? value.slice(1) : value;
    },
  });

  /**
   * Función para actualizar el color que también valida el formato
   * @param newColor - El nuevo color en formato hex
   */
  const updateColor = (newColor: string) => {
    if (!newColor) {
      setColor("");
      return;
    }

    const normalized = newColor.startsWith("#") ? newColor : `#${newColor}`;

    if (isValidHex(normalized)) {
      setColor(normalized);
    }
  };

  return [color, updateColor] as const;
}

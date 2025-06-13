'use client';

import React from 'react';
import {
  Button,
  Card,
  Heading,
  Text,
  Flex,
  Grid,
  TextField,
  CheckboxField,
  RadioGroupField,
  Radio,
  SelectField,
  SwitchField,
  Badge,
  Alert,
  Divider
} from '@aws-amplify/ui-react';

/**
 * Componente de demostración que muestra los componentes de Amplify UI
 * con el tema personalizado aplicado
 */
export default function AmplifyUIShowcase() {
  const [textValue, setTextValue] = React.useState('');
  const [checkboxValue, setCheckboxValue] = React.useState(false);
  const [radioValue, setRadioValue] = React.useState('basic');
  const [selectValue, setSelectValue] = React.useState('');
  const [switchValue, setSwitchValue] = React.useState(false);

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center mb-8">
        <Heading level={2} className="mb-4">
          Demostración de Componentes Amplify UI
        </Heading>
        <Text>
          Todos estos componentes se adaptan automáticamente al tema personalizado (modo claro/oscuro)
        </Text>
      </div>

      {/* Grid de componentes */}
      <Grid templateColumns={{ base: '1fr', medium: '1fr 1fr' }} gap="2rem">
        
        {/* Botones */}
        <Card>
          <Heading level={3}>Botones</Heading>
          <Flex direction="column" gap="1rem">
            <Button variation="primary">Botón Primario</Button>
            <Button variation="destructive">Botón Destructivo</Button>
            <Button variation="link">Botón Link</Button>
            <Button isDisabled>Botón Deshabilitado</Button>
          </Flex>
        </Card>

        {/* Tipografía */}
        <Card>
          <Heading level={3}>Tipografía</Heading>
          <Flex direction="column" gap="0.5rem">
            <Heading level={1}>Heading 1</Heading>
            <Heading level={2}>Heading 2</Heading>
            <Heading level={3}>Heading 3</Heading>
            <Text>Texto normal</Text>
            <Text fontSize="small">Texto pequeño</Text>
            <Text fontSize="large">Texto grande</Text>
          </Flex>
        </Card>

        {/* Alertas y Estados */}
        <Card>
          <Heading level={3}>Alertas y Estados</Heading>
          <Flex direction="column" gap="1rem">
            <Alert variation="info">
              Esta es una alerta informativa
            </Alert>
            <Alert variation="success">
              ¡Operación completada con éxito!
            </Alert>
            <Alert variation="warning">
              Advertencia: revisa los datos
            </Alert>
            <Alert variation="error">
              Error: algo salió mal
            </Alert>
          </Flex>
        </Card>

        {/* Badges */}
        <Card>
          <Heading level={3}>Badges</Heading>
          <Flex gap="0.5rem" wrap="wrap">
            <Badge variation="info">Info</Badge>
            <Badge variation="success">Success</Badge>
            <Badge variation="warning">Warning</Badge>
            <Badge variation="error">Error</Badge>
          </Flex>
        </Card>

        {/* Campos de Formulario */}
        <Card>
          <Heading level={3}>Campos de Formulario</Heading>
          <Flex direction="column" gap="1rem">
            <TextField
              label="Campo de Texto"
              placeholder="Escribe algo aquí..."
              value={textValue}
              onChange={(e) => setTextValue(e.target.value)}
            />
            
            <SelectField
              label="Campo de Selección"
              value={selectValue}
              onChange={(e) => setSelectValue(e.target.value)}
            >
              <option value="">Selecciona una opción</option>
              <option value="option1">Opción 1</option>
              <option value="option2">Opción 2</option>
              <option value="option3">Opción 3</option>
            </SelectField>

            <CheckboxField
              name="accept-terms"
              label="Acepto los términos y condiciones"
              checked={checkboxValue}
              onChange={(e) => setCheckboxValue(e.target.checked)}
            />

            <SwitchField
              label="Notificaciones"
              isChecked={switchValue}
              onChange={(e) => setSwitchValue(e.target.checked)}
            />
          </Flex>
        </Card>

        {/* Radio Group */}
        <Card>
          <Heading level={3}>Grupo de Radio</Heading>
          <RadioGroupField
            legend="Plan de suscripción"
            name="subscription-plan"
            value={radioValue}
            onChange={(e) => setRadioValue(e.target.value)}
          >
            <Radio value="basic">Plan Básico</Radio>
            <Radio value="premium">Plan Premium</Radio>
            <Radio value="enterprise">Plan Empresarial</Radio>
          </RadioGroupField>
        </Card>
      </Grid>

      <Divider />

      {/* Sección adicional para mostrar interactividad */}
      <Card>
        <Heading level={3}>Estado Interactivo</Heading>
        <Text>
          Valores actuales de los campos:
        </Text>
        <Flex direction="column" gap="0.5rem" marginTop="1rem">
          <Text><strong>Campo de texto:</strong> {textValue || 'Vacío'}</Text>
          <Text><strong>Checkbox:</strong> {checkboxValue ? 'Marcado' : 'No marcado'}</Text>
          <Text><strong>Radio seleccionado:</strong> {radioValue}</Text>
          <Text><strong>Select:</strong> {selectValue || 'Ninguno'}</Text>
          <Text><strong>Switch:</strong> {switchValue ? 'Activado' : 'Desactivado'}</Text>
        </Flex>
      </Card>
    </div>
  );
}

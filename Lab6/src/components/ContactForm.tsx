import { useState } from 'react';
import type { FormEvent } from 'react';
import type { ContactInput } from '../types';

interface ContactFormProps {
  initialValues?: ContactInput;
  submitLabel?: string;
  onSubmit: (values: ContactInput) => void;
  onCancel?: () => void;
}

type Errors = Partial<Record<keyof ContactInput, string>>;

const EMPTY: ContactInput = { name: '', phone: '', email: '' };

function validate(values: ContactInput): Errors {
  const errors: Errors = {};
  if (!values.name.trim()) errors.name = 'El nombre es obligatorio';
  if (!/^[+\d][\d\s-]{5,}$/.test(values.phone.trim())) {
    errors.phone = 'Ingresa un teléfono válido';
  }
  if (!/^\S+@\S+\.\S+$/.test(values.email.trim())) {
    errors.email = 'Ingresa un correo válido';
  }
  return errors;
}

export default function ContactForm({
  initialValues = EMPTY,
  submitLabel = 'Guardar contacto',
  onSubmit,
  onCancel,
}: ContactFormProps) {
  const [values, setValues] = useState<ContactInput>(initialValues);
  const [errors, setErrors] = useState<Errors>({});

  const handleChange = (field: keyof ContactInput, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    onSubmit({
      name: values.name.trim(),
      phone: values.phone.trim(),
      email: values.email.trim(),
    });
    if (initialValues === EMPTY) setValues(EMPTY); 
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="card form">
      <div className="field">
        <label htmlFor="contact-name">Nombre</label>
        <input
          id="contact-name"
          value={values.name}
          onChange={(e) => handleChange('name', e.target.value)}
        />
        {errors.name && <p role="alert" className="error">{errors.name}</p>}
      </div>

      <div className="field">
        <label htmlFor="contact-phone">Teléfono</label>
        <input
          id="contact-phone"
          value={values.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
        />
        {errors.phone && <p role="alert" className="error">{errors.phone}</p>}
      </div>

      <div className="field">
        <label htmlFor="contact-email">Correo electrónico</label>
        <input
          id="contact-email"
          type="email"
          value={values.email}
          onChange={(e) => handleChange('email', e.target.value)}
        />
        {errors.email && <p role="alert" className="error">{errors.email}</p>}
      </div>

      <div className="actions">
        <button type="submit">{submitLabel}</button>
        {onCancel && (
          <button type="button" className="secondary" onClick={onCancel}>
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}

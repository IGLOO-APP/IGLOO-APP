import { useState } from 'react';

export function useTicketForm(onSubmit: (ticket: any) => Promise<void>, onClose: () => void) {
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('technical');
  const [priority, setPriority] = useState('Média');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) return;

    setSubmitting(true);
    try {
      await onSubmit({
        subject: subject.trim(),
        description: description.trim(),
        category,
        priority,
      });
      setSubject('');
      setDescription('');
      setCategory('technical');
      setPriority('Média');
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return {
    subject,
    setSubject,
    description,
    setDescription,
    category,
    setCategory,
    priority,
    setPriority,
    submitting,
    handleSubmit,
  };
}

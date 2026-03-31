import { FAQ } from '../types';

const FAQ_STORAGE_KEY = 'igloo_faqs';

const defaultFAQs: FAQ[] = [
  {
    id: '1',
    question: 'Posso furar as paredes (prateleiras/TV)?',
    answer: 'Geralmente é permitido, mas tenha cuidado com canos e fiação. Lembre-se: ao devolver o imóvel, é obrigatório tapar todos os furos e pintar a parede.',
    order: 1,
    is_active: true,
  },
  {
    id: '2',
    question: 'A internet/Wi-Fi está lenta',
    answer: 'Se a internet for compartilhada do condomínio, evite downloads pesados em horários de pico. Reinicie seu dispositivo. Se persistir, abra um chamado.',
    order: 2,
    is_active: true,
  },
  {
    id: '3',
    question: 'Regras de Silêncio e Barulho',
    answer: 'Em kitnets, o som propaga facilmente. Respeite rigorosamente o silêncio entre 22h e 08h. Use fones de ouvido para música alta ou TV.',
    order: 3,
    is_active: true,
  },
  {
    id: '4',
    question: 'Uso da Lavanderia Compartilhada',
    answer: 'Respeite a fila ou agendamento. Limpe o filtro da secadora após o uso e não deixe roupas esquecidas na máquina após o término do ciclo.',
    order: 4,
    is_active: true,
  },
  {
    id: '5',
    question: 'Vazamento pequeno, o que fazer?',
    answer: 'Feche o registro local (geralmente embaixo da pia ou no banheiro) imediatamente para evitar desperdício e danos, e abra um chamado de Hidráulica.',
    order: 5,
    is_active: true,
  },
  {
    id: '6',
    question: 'Posso receber visitas?',
    answer: 'Visitas são permitidas, mas verifique no seu contrato as regras sobre pernoite frequente e ocupação máxima da unidade.',
    order: 6,
    is_active: true,
  },
];

export const faqService = {
  getFAQs(): FAQ[] {
    try {
      const stored = localStorage.getItem(FAQ_STORAGE_KEY);
      if (!stored) {
        this.saveFAQs(defaultFAQs);
        return defaultFAQs;
      }
      return JSON.parse(stored);
    } catch (e) {
      console.error('Error parsing FAQs:', e);
      return defaultFAQs;
    }
  },

  getActiveFAQs(): FAQ[] {
    return this.getFAQs().filter(f => f.is_active).sort((a, b) => a.order - b.order);
  },

  saveFAQs(faqs: FAQ[]) {
    localStorage.setItem(FAQ_STORAGE_KEY, JSON.stringify(faqs));
  },

  addFAQ(faq: Omit<FAQ, 'id' | 'created_at'>): FAQ {
    const faqs = this.getFAQs();
    const newFaq: FAQ = {
      ...faq,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
    };
    this.saveFAQs([...faqs, newFaq]);
    return newFaq;
  },

  updateFAQ(id: string, updates: Partial<FAQ>): FAQ {
    const faqs = this.getFAQs();
    const index = faqs.findIndex(f => f.id === id);
    if (index === -1) throw new Error('FAQ not found');
    
    faqs[index] = { ...faqs[index], ...updates };
    this.saveFAQs(faqs);
    return faqs[index];
  },

  deleteFAQ(id: string) {
    const faqs = this.getFAQs();
    this.saveFAQs(faqs.filter(f => f.id !== id));
  },

  reorderFAQs(orderedIds: string[]) {
    const faqs = this.getFAQs();
    const reordered = orderedIds.map((id, index) => {
      const faq = faqs.find(f => f.id === id);
      if (faq) return { ...faq, order: index + 1 };
      return null;
    }).filter(f => f !== null) as FAQ[];
    
    this.saveFAQs(reordered);
  }
};

import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { faqService } from '../../../services/faqService';
import { supportService } from '../../../services/supportService';
import { tenantService } from '../../../services/tenancy/tenantService';
import type { FAQ } from '../../../types';
import type { LucideIcon } from 'lucide-react';
import {
  Droplets,
  Zap,
  Home,
  CloudRain,
  Shield,
  Smartphone,
  Sparkles,
  DollarSign,
  Wrench,
  HelpCircle,
  AlertCircle,
} from 'lucide-react';

export function useTickets() {
  const { user } = useAuth();

  const [showCreateSupportModal, setShowCreateSupportModal] = useState(false);
  const [showFAQManager, setShowFAQManager] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [categories, setCategories] = useState<
    { id: string; name: string; icon_name: string; color_class: string; bg_class: string }[]
  >([]);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [newFaq, setNewFaq] = useState<Partial<FAQ>>({ question: '', answer: '', is_active: true });

  const getIconComponent = (iconName: string) => {
    const icons: Record<string, LucideIcon> = {
      Droplets,
      Zap,
      Home,
      CloudRain,
      Shield,
      Smartphone,
      Sparkles,
      DollarSign,
      Wrench,
      HelpCircle,
      AlertCircle,
    };
    return icons[iconName] || Wrench;
  };

  useEffect(() => {
    const fetchFaqs = async () => {
      if (showFAQManager) {
        const data = await faqService.getFAQs();
        setFaqs(data);
      }
    };
    fetchFaqs();
  }, [showFAQManager]);

  useEffect(() => {
    const fetchCategories = async () => {
      const data = await tenantService.getMaintenanceCategories();
      setCategories(data);
    };
    fetchCategories();
  }, [showCategoryManager]);

  const handleSaveCategory = async (
    newCat: Partial<{ name: string; icon_name: string; color_class: string; bg_class: string }>
  ) => {
    try {
      await tenantService.addMaintenanceCategory(
        newCat as { name: string; icon_name: string; color_class: string; bg_class: string }
      );
      const updated = await tenantService.getMaintenanceCategories();
      setCategories(updated);
    } catch {
      // ignore
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta categoria?')) {
      try {
        await tenantService.deleteMaintenanceCategory(id);
        const updated = await tenantService.getMaintenanceCategories();
        setCategories(updated);
      } catch {
        // ignore
      }
    }
  };

  const handleSaveFAQ = async () => {
    if (editingFaq) {
      await faqService.updateFAQ(editingFaq.id, editingFaq);
    } else if (newFaq.question && newFaq.answer) {
      await faqService.addFAQ({
        question: newFaq.question,
        answer: newFaq.answer,
        order: faqs.length + 1,
        is_active: newFaq.is_active ?? true,
      });
    }
    const updated = await faqService.getFAQs();
    setFaqs(updated);
    setEditingFaq(null);
    setNewFaq({ question: '', answer: '', is_active: true });
  };

  const handleDeleteFAQ = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta FAQ?')) {
      await faqService.deleteFAQ(id);
      const updated = await faqService.getFAQs();
      setFaqs(updated);
    }
  };

  const toggleFAQStatus = async (faq: FAQ) => {
    await faqService.updateFAQ(faq.id, { is_active: !faq.is_active });
    const updated = await faqService.getFAQs();
    setFaqs(updated);
  };

  const handleCreateSupportSubmit = async (ticketData: {
    subject: string;
    description: string;
    category: string;
    priority: string;
  }) => {
    if (!user) return;
    try {
      await supportService.createTicket({
        user_id: user.id,
        subject: ticketData.subject,
        description: ticketData.description,
        category: ticketData.category,
        priority: ticketData.priority,
      });
    } catch {
      // ignore
    }
  };

  return {
    showCreateSupportModal,
    setShowCreateSupportModal,
    showFAQManager,
    setShowFAQManager,
    showCategoryManager,
    setShowCategoryManager,
    editingFaq,
    setEditingFaq,
    newFaq,
    setNewFaq,
    faqs,
    categories,
    handleSaveCategory,
    handleDeleteCategory,
    handleSaveFAQ,
    handleDeleteFAQ,
    toggleFAQStatus,
    handleCreateSupportSubmit,
    getIconComponent,
  };
}

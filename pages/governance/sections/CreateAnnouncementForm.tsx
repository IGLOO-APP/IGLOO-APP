import React from 'react';
import { Send, AlertTriangle, Check, Users, Building2, User, Home, ChevronRight, CalendarDays, Eye } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { AnnouncementTargetType } from '../../../types';

interface CreateAnnouncementFormProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  handleSubmit: () => Promise<void>;
  saving: boolean;
  condominiums: string[];
  properties: any[];
  announcementTypes: any[];
}

export const CreateAnnouncementForm: React.FC<CreateAnnouncementFormProps> = ({
  formData,
  setFormData,
  handleSubmit,
  saving,
  condominiums,
  properties,
  announcementTypes,
}) => {
  return (
    <div className='space-y-6'>
      <div className='flex gap-2 flex-wrap'>
        {announcementTypes.map(({ value, label, icon: Icon }) => {
          const isActive = formData.type === value;
          const colorMap: Record<string, string> = {
            maintenance: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
            warning: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
            event: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
            info: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
          };
          return (
            <button
              key={value}
              onClick={() => setFormData((prev: any) => ({ ...prev, type: value }))}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                isActive
                  ? `${colorMap[value]} ring-2 ring-offset-1 ring-offset-transparent`
                  : 'bg-slate-100 dark:bg-white/10 text-slate-400 hover:text-slate-600 dark:hover:text-white/70'
              }`}
            >
              <Icon size={12} strokeWidth={isActive ? 2.5 : 1.5} />
              {label}
            </button>
          );
        })}
      </div>

      <div className='space-y-1.5'>
        <Label className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>Título</Label>
        <Input
          placeholder='Ex: Manutenção no Elevador'
          value={formData.title}
          onChange={(e) => setFormData((prev: any) => ({ ...prev, title: e.target.value }))}
        />
      </div>

      <div className='space-y-1.5'>
        <Label className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>Mensagem</Label>
        <textarea
          placeholder='Descreva os detalhes...'
          rows={4}
          value={formData.content}
          onChange={(e) => setFormData((prev: any) => ({ ...prev, content: e.target.value }))}
          className='w-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl px-4 py-3 text-sm outline-none resize-none'
        />
      </div>

      <button
        onClick={() => setFormData((prev: any) => ({ ...prev, is_urgent: !prev.is_urgent }))}
        className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all ${formData.is_urgent ? 'border-rose-500 bg-rose-50' : 'border-border'}`}
      >
        <AlertTriangle className={formData.is_urgent ? 'text-rose-500' : 'text-slate-400'} size={20} />
        <div className='flex-1 text-left'>
          <p className='text-sm font-bold'>Urgente</p>
          <p className='text-xs text-muted-foreground'>Dar destaque visual ao aviso</p>
        </div>
        <Switch checked={formData.is_urgent} onCheckedChange={(v) => setFormData((prev: any) => ({ ...prev, is_urgent: v }))} />
      </button>

      <div className='pt-4'>
        <button
          onClick={handleSubmit}
          disabled={saving}
          className='w-full py-3 bg-primary text-white rounded-xl font-bold text-sm hover:opacity-90 flex items-center justify-center gap-2'
        >
          {saving ? 'Enviando...' : <><Send size={16} /> Enviar Comunicado</>}
        </button>
      </div>
    </div>
  );
};

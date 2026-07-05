import React from 'react';
import { Info } from 'lucide-react';
import { SystemAnnouncement } from '../../../types';

interface AnnouncementsProps {
  announcements: SystemAnnouncement[];
}

export const Announcements: React.FC<AnnouncementsProps> = ({ announcements }) => {
  return (
    <div className='px-6 mb-24'>
      <div className='bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 rounded-3xl p-6 shadow-sm'>
        <div className='flex items-center justify-between mb-6'>
          <div className='flex items-center gap-2.5'>
            <div className='w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500'>
              <Info size={18} />
            </div>
            <h4 className='font-black text-slate-900 dark:text-white text-sm uppercase tracking-widest'>
              Avisos
            </h4>
          </div>
          <span className='text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-white/5 px-2.5 py-1 rounded-full'>
            {announcements.length} {announcements.length === 1 ? 'aviso' : 'avisos'}
          </span>
        </div>
        <div className='space-y-4'>
          {announcements.length > 0 ? (
            announcements.map((ann) => (
              <div key={ann.id} className='flex gap-4 items-center group cursor-pointer'>
                <div
                  className={`w-1.5 h-10 rounded-full shrink-0 ${
                    ann.type === 'maintenance' ? 'bg-orange-500' : 'bg-slate-200 dark:bg-slate-800'
                  } group-hover:opacity-80 transition-opacity`}
                ></div>
                <div className='flex-1'>
                  <div className='flex justify-between items-center mb-1'>
                    <p className='text-sm font-bold text-slate-800 dark:text-slate-200 line-clamp-1'>
                      {ann.title}
                    </p>
                    <span className='px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-slate-100 text-slate-500 dark:bg-white/5'>
                      {new Date(ann.created_at).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className='text-[11px] text-slate-500 font-medium line-clamp-1'>
                    {ann.content}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className='text-center py-4 text-slate-400 text-xs font-bold uppercase tracking-widest'>
              Sem avisos no momento
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

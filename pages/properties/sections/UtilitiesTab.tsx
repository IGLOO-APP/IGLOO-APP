import React, { useState, useEffect, useCallback } from 'react';
import { Zap, Droplets, Flame, Plus, Trash2, Users } from 'lucide-react';
import { Property } from '../../../types';
import { PropertyUnit, UtilityBill } from '../../../types/utility';
import { utilityService } from '../../../services/utilityService';

interface UtilitiesTabProps {
  property: Property;
}

export const UtilitiesTab: React.FC<UtilitiesTabProps> = ({ property }) => {
  const [units, setUnits] = useState<PropertyUnit[]>([]);
  const [bills, setBills] = useState<UtilityBill[]>([]);
  const [showAddUnit, setShowAddUnit] = useState(false);
  const [newUnitName, setNewUnitName] = useState('');
  const [showAddBill, setShowAddBill] = useState(false);
  const [billType, setBillType] = useState<'water' | 'electricity' | 'gas'>('water');
  const [billAmount, setBillAmount] = useState('');
  const [billDate, setBillDate] = useState(new Date().toISOString().split('T')[0]);
  const [method, setMethod] = useState<'fixed' | 'people'>('fixed');
  const [apportionmentResult, setApportionmentResult] = useState<{
    distribution: { name: string; share: number; note?: string }[];
    ownerTotal: number;
  } | null>(null);

  const refreshData = useCallback(async () => {
    const [fetchedUnits, fetchedBills] = await Promise.all([
      utilityService.getUnits(property.id),
      utilityService.getBills(property.id),
    ]);
    setUnits(fetchedUnits);
    setBills(fetchedBills);
  }, [property.id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refreshData();
  }, [refreshData]);

  const handleAddUnit = async () => {
    if (!newUnitName.trim()) return;
    await utilityService.createUnit({
      property_id: property.id,
      name: newUnitName.trim(),
      is_occupied: false,
      residents_count: 1,
    });
    setNewUnitName('');
    setShowAddUnit(false);
    refreshData();
  };

  const handleDeleteUnit = async (id: string) => {
    await utilityService.deleteUnit(id);
    refreshData();
  };

  const handleCalculateApportionment = () => {
    if (units.length === 0 || !billAmount) return;
    const result = utilityService.calculateApportionment(Number(billAmount), units, method);
    setApportionmentResult(result);
  };

  const handleSaveBill = async () => {
    if (!apportionmentResult || !billAmount || units.length === 0) return;
    const billUnits = apportionmentResult.distribution.map((d) => {
      const unit = units.find((u) => u.name === d.name);
      return {
        unit_name: d.name,
        tenant_id: unit?.current_tenant_id,
        share_amount: d.share,
        is_owner_cost: !!d.note,
      };
    });

    await utilityService.createBill(
      {
        property_id: property.id,
        owner_id: property.owner_id ?? '',
        bill_type: billType,
        total_amount: Number(billAmount),
        bill_date: billDate,
        apportionment_method: method,
      },
      billUnits
    );

    setShowAddBill(false);
    setBillAmount('');
    setApportionmentResult(null);
    refreshData();
  };

  const BILL_ICONS = { water: Droplets, electricity: Zap, gas: Flame };
  const BILL_LABELS = { water: 'Água', electricity: 'Luz', gas: 'Gás' };

  return (
    <div className='animate-fadeIn space-y-6'>
      {/* Units Section */}
      <div className='bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-white/5 p-5'>
        <div className='flex items-center justify-between mb-4'>
          <div>
            <h3 className='text-sm font-black text-slate-900 dark:text-white'>Unidades</h3>
            <p className='text-[10px] text-slate-400 font-medium'>Unidades para rateio de contas</p>
          </div>
          <button
            onClick={() => setShowAddUnit(!showAddUnit)}
            className='flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-primary-dark transition-all active:scale-95'
          >
            <Plus size={12} /> Unidade
          </button>
        </div>

        {showAddUnit && (
          <div className='flex items-center gap-2 mb-4 p-3 bg-slate-50 dark:bg-white/5 rounded-xl'>
            <input
              type='text'
              value={newUnitName}
              onChange={(e) => setNewUnitName(e.target.value)}
              placeholder='Ex: Kitnet 1, Quarto A, AP 101...'
              className='flex-1 px-3 py-2 bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/10 rounded-xl text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30'
              onKeyDown={(e) => e.key === 'Enter' && handleAddUnit()}
            />
            <button
              onClick={handleAddUnit}
              className='px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-[9px] font-black uppercase tracking-widest hover:opacity-90 transition-all'
            >
              Adicionar
            </button>
          </div>
        )}

        {units.length === 0 ? (
          <div className='text-center py-8 text-slate-400'>
            <p className='text-sm font-bold'>Nenhuma unidade cadastrada</p>
            <p className='text-[10px] mt-1'>
              Adicione unidades para ratear contas de água, luz e gás
            </p>
          </div>
        ) : (
          <div className='space-y-2'>
            {units.map((unit) => (
              <div
                key={unit.id}
                className='flex items-center justify-between p-3 bg-slate-50 dark:bg-white/5 rounded-xl'
              >
                <div className='flex items-center gap-3'>
                  <div className='p-1.5 rounded-lg bg-primary/10 text-primary'>
                    <Users size={14} />
                  </div>
                  <div>
                    <p className='text-sm font-black text-slate-900 dark:text-white'>{unit.name}</p>
                    <p className='text-[9px] text-slate-400 font-medium'>
                      {unit.is_occupied ? 'Ocupado' : 'Vago'} &middot; {unit.residents_count}{' '}
                      morador(es)
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteUnit(unit.id)}
                  className='p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all'
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Bill Section */}
      <div className='bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-white/5 p-5'>
        <div className='flex items-center justify-between mb-4'>
          <div>
            <h3 className='text-sm font-black text-slate-900 dark:text-white'>Rateio de Conta</h3>
            <p className='text-[10px] text-slate-400 font-medium'>
              Divida a conta entre as unidades
            </p>
          </div>
          <button
            onClick={() => {
              setShowAddBill(!showAddBill);
              setApportionmentResult(null);
            }}
            className='flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-primary-dark transition-all active:scale-95'
          >
            <Plus size={12} /> Nova Conta
          </button>
        </div>

        {showAddBill && (
          <div className='p-4 bg-slate-50 dark:bg-white/5 rounded-xl space-y-4'>
            <div className='flex gap-3'>
              {(['water', 'electricity', 'gas'] as const).map((type) => {
                const Icon = BILL_ICONS[type];
                return (
                  <button
                    key={type}
                    onClick={() => setBillType(type)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      billType === type
                        ? 'bg-primary text-white shadow-md'
                        : 'bg-white dark:bg-surface-dark text-slate-400 border border-gray-200 dark:border-white/10'
                    }`}
                  >
                    <Icon size={14} /> {BILL_LABELS[type]}
                  </button>
                );
              })}
            </div>

            <div className='grid grid-cols-2 gap-3'>
              <div>
                <label className='text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1'>
                  Valor Total (R$)
                </label>
                <input
                  type='number'
                  value={billAmount}
                  onChange={(e) => setBillAmount(e.target.value)}
                  placeholder='0,00'
                  className='w-full px-3 py-2 bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/10 rounded-xl text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30'
                />
              </div>
              <div>
                <label className='text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1'>
                  Data da Conta
                </label>
                <input
                  type='date'
                  value={billDate}
                  onChange={(e) => setBillDate(e.target.value)}
                  className='w-full px-3 py-2 bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/10 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/30'
                />
              </div>
            </div>

            <div>
              <label className='text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1'>
                Método de Rateio
              </label>
              <div className='flex gap-3'>
                <button
                  onClick={() => setMethod('fixed')}
                  className={`flex-1 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    method === 'fixed'
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md'
                      : 'bg-white dark:bg-surface-dark text-slate-400 border border-gray-200 dark:border-white/10'
                  }`}
                >
                  Por Unidade
                </button>
                <button
                  onClick={() => setMethod('people')}
                  className={`flex-1 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    method === 'people'
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md'
                      : 'bg-white dark:bg-surface-dark text-slate-400 border border-gray-200 dark:border-white/10'
                  }`}
                >
                  Por Pessoa
                </button>
              </div>
            </div>

            {billAmount && units.length > 0 && (
              <button
                onClick={handleCalculateApportionment}
                className='w-full py-3 bg-primary/10 text-primary rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary/20 transition-all active:scale-95'
              >
                Calcular Rateio
              </button>
            )}

            {apportionmentResult && (
              <div className='space-y-2'>
                <p className='text-[9px] font-black text-slate-400 uppercase tracking-widest'>
                  Resultado do Rateio
                </p>
                <div className='space-y-1.5'>
                  {apportionmentResult.distribution.map((d, i) => (
                    <div
                      key={i}
                      className='flex items-center justify-between px-3 py-2 bg-white dark:bg-surface-dark rounded-xl'
                    >
                      <div>
                        <p className='text-sm font-bold text-slate-900 dark:text-white'>{d.name}</p>
                        {d.note && <p className='text-[9px] text-slate-400'>{d.note}</p>}
                      </div>
                      <p className='text-sm font-black text-slate-900 dark:text-white'>
                        R$ {d.share.toFixed(2)}
                      </p>
                    </div>
                  ))}
                  <div className='flex items-center justify-between px-3 py-2 bg-amber-50 dark:bg-amber-950/20 rounded-xl'>
                    <p className='text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest'>
                      Custo do Proprietário
                    </p>
                    <p className='text-sm font-black text-amber-600 dark:text-amber-400'>
                      R$ {apportionmentResult.ownerTotal.toFixed(2)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleSaveBill}
                  className='w-full py-3 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all active:scale-95'
                >
                  Salvar Rateio
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bills History */}
      {bills.length > 0 && (
        <div className='bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-white/5 p-5'>
          <h3 className='text-sm font-black text-slate-900 dark:text-white mb-4'>
            Histórico de Contas
          </h3>
          <div className='space-y-2'>
            {bills.map((bill) => {
              const Icon = BILL_ICONS[bill.bill_type];
              return (
                <div
                  key={bill.id}
                  className='flex items-center justify-between p-3 bg-slate-50 dark:bg-white/5 rounded-xl'
                >
                  <div className='flex items-center gap-3'>
                    <div className='p-1.5 rounded-lg bg-primary/10 text-primary'>
                      <Icon size={14} />
                    </div>
                    <div>
                      <div className='flex items-center gap-2'>
                        <p className='text-sm font-black text-slate-900 dark:text-white'>
                          {BILL_LABELS[bill.bill_type]}
                        </p>
                        <span className='text-[8px] px-1.5 py-0.5 rounded-md bg-slate-200 dark:bg-white/10 text-slate-500 font-black uppercase tracking-widest'>
                          {bill.apportionment_method === 'fixed' ? 'Por Unidade' : 'Por Pessoa'}
                        </span>
                      </div>
                      <p className='text-[9px] text-slate-400 font-medium'>{bill.bill_date}</p>
                    </div>
                  </div>
                  <p className='text-sm font-black text-slate-900 dark:text-white'>
                    R$ {bill.total_amount.toFixed(2)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

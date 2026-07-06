import { supabase } from '../lib/supabase';
import { PropertyUnit, UtilityBill, UtilityBillUnit } from '../types/utility';
import { calculateApportionment, UnitParams } from '../utils/financialCalculations';

/* eslint-disable @typescript-eslint/no-explicit-any */

export const utilityService = {
  async getUnits(propertyId: string): Promise<PropertyUnit[]> {
    const { data, error } = await (supabase.from as any)('property_units')
      .select('*')
      .eq('property_id', propertyId)
      .order('name');
    if (error) throw error;
    return (data ?? []) as PropertyUnit[];
  },

  async createUnit(unit: Omit<PropertyUnit, 'id' | 'created_at'>): Promise<PropertyUnit> {
    const { data, error } = await (supabase.from as any)('property_units')
      .insert(unit)
      .select()
      .single();
    if (error) throw error;
    return data as PropertyUnit;
  },

  async updateUnit(id: string, updates: Partial<PropertyUnit>): Promise<void> {
    const { error } = await (supabase.from as any)('property_units').update(updates).eq('id', id);
    if (error) throw error;
  },

  async deleteUnit(id: string): Promise<void> {
    const { error } = await (supabase.from as any)('property_units').delete().eq('id', id);
    if (error) throw error;
  },

  async getBills(propertyId: string): Promise<UtilityBill[]> {
    const { data, error } = await (supabase.from as any)('utility_bills')
      .select('*, units:utility_bill_units(*)')
      .eq('property_id', propertyId)
      .order('bill_date', { ascending: false });
    if (error) throw error;
    return (data ?? []) as UtilityBill[];
  },

  async createBill(
    bill: Omit<UtilityBill, 'id' | 'created_at' | 'units'>,
    billUnits: Omit<UtilityBillUnit, 'id' | 'created_at' | 'utility_bill_id'>[]
  ): Promise<UtilityBill> {
    const { data, error } = await (supabase.from as any)('utility_bills')
      .insert(bill)
      .select()
      .single();
    if (error) throw error;

    if (billUnits.length > 0) {
      const billId = (data as UtilityBill).id;
      const unitsToInsert = billUnits.map((u) => ({ ...u, utility_bill_id: billId }));
      const { error: unitsError } = await (supabase.from as any)('utility_bill_units').insert(
        unitsToInsert
      );
      if (unitsError) throw unitsError;
    }

    return data as UtilityBill;
  },

  async deleteBill(id: string): Promise<void> {
    const { error } = await (supabase.from as any)('utility_bills').delete().eq('id', id);
    if (error) throw error;
  },

  calculateApportionment(totalExpense: number, units: PropertyUnit[], method: 'fixed' | 'people') {
    const params: UnitParams[] = units.map((u) => ({
      id: u.id,
      name: u.name,
      isOccupied: u.is_occupied,
      residentsCount: u.residents_count,
    }));
    return calculateApportionment(totalExpense, params, method);
  },
};

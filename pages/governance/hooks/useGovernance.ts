import { useState, useCallback, useEffect, useMemo } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { announcementService } from '../../../services/announcementService';
import { propertyService } from '../../../services/propertyService';
import { OwnerAnnouncement, Property, AnnouncementType, AnnouncementTargetType } from '../../../types';
import { toast } from 'sonner';

export function useGovernance() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [announcements, setAnnouncements] = useState<OwnerAnnouncement[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [mode, setMode] = useState<'list' | 'create' | 'history'>('list');

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [annData, propData] = await Promise.all([
        user.role === 'owner'
          ? announcementService.getForOwner(user.id)
          : announcementService.getForTenant(user.id),
        user.role === 'owner'
          ? propertyService.getAll().catch(() => [] as Property[])
          : Promise.resolve([]),
      ]);
      setAnnouncements(
        (annData || []).filter((a) => !a.expires_at || new Date(a.expires_at) > new Date())
      );
      if (propData) setProperties(propData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    loading,
    announcements,
    properties,
    mode,
    setMode,
    fetchData,
  };
}

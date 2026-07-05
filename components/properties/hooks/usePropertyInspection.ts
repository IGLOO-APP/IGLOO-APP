import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../lib/supabase';
import { Property } from '../../../types';
import {
  inspectionService,
  Inspection,
  Room,
  InspectionSignature,
} from '../../../services/inspectionService';

export type ViewType = 'list' | 'detail' | 'create' | 'compare';
export type NewRoomType = 'entrada' | 'saída' | 'periódica';
export type VisibilityType = 'admin' | 'tenant';
export type RoomCondition = 'bom' | 'regular' | 'danificado';
export type SignerType = 'owner' | 'tenant';

export interface NewRoom {
  room_name: string;
  condition: RoomCondition;
  notes: string;
  photos: string[];
  videos: string[];
}

export const ROOM_TEMPLATES = [
  'Sala',
  'Quarto 1',
  'Quarto 2',
  'Cozinha',
  'Banheiro',
  'Área Externa',
] as const;

export const getConditionLabelAndStyle = (cond: RoomCondition) => {
  switch (cond) {
    case 'bom':
      return { label: 'BOM', style: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
    case 'regular':
      return { label: 'REGULAR', style: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
    case 'danificado':
      return { label: 'DANIFICADO', style: 'bg-rose-500/10 text-rose-400 border-rose-500/20' };
  }
};

interface UsePropertyInspectionProps {
  property: Property;
  initialView?: 'list' | 'detail';
  isTenant?: boolean;
}

export const usePropertyInspection = ({
  property,
  initialView = 'list',
}: UsePropertyInspectionProps) => {
  const [view, setView] = useState<ViewType>(initialView === 'detail' ? 'detail' : 'list');
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [selectedInspection, setSelectedInspection] = useState<Inspection | null>(null);
  const [selectedInspectionRooms, setSelectedInspectionRooms] = useState<Room[]>([]);
  const [selectedInspectionSignatures, setSelectedInspectionSignatures] = useState<
    InspectionSignature[]
  >([]);

  const [selectedForComparison, setSelectedForComparison] = useState<string[]>([]);
  const [compareRooms1, setCompareRooms1] = useState<Room[]>([]);
  const [compareRooms2, setCompareRooms2] = useState<Room[]>([]);
  const [compareIns1, setCompareIns1] = useState<Inspection | null>(null);
  const [compareIns2, setCompareIns2] = useState<Inspection | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingRoom, setUploadingRoom] = useState<string | null>(null);
  const [uploadingVideoRoom, setUploadingVideoRoom] = useState<string | null>(null);

  // Form States for "Nova Vistoria"
  const [newType, setNewType] = useState<NewRoomType>('entrada');
  const [newDate, setNewDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [newInspector, setNewInspector] = useState<string>('');
  const [newVisibility, setNewVisibility] = useState<VisibilityType>('admin');
  const [newRooms, setNewRooms] = useState<NewRoom[]>(
    ROOM_TEMPLATES.map((name) => ({
      room_name: name,
      condition: 'bom' as RoomCondition,
      notes: '',
      photos: [],
      videos: [],
    }))
  );
  const [expandedRoom, setExpandedRoom] = useState<string | null>('Sala');
  const [newGeneralNotes, setNewGeneralNotes] = useState<string>('');
  const [newPendingItems, setNewPendingItems] = useState<string>('');

  // Signature dialog/action states
  const [showSignModal, setShowSignModal] = useState(false);
  const [signName, setSignName] = useState('');
  const [signCpf, setSignCpf] = useState('');
  const [signerType, setSignerType] = useState<SignerType>('owner');

  // Load inspections list
  const loadInspections = useCallback(async () => {
    setIsLoading(true);
    const data = await inspectionService.getByProperty(property.id.toString());
    setInspections(data);
    setIsLoading(false);
  }, [property.id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadInspections();
  }, [loadInspections]);

  const fetchInspectionDetails = useCallback(async (ins: Inspection) => {
    setIsLoading(true);
    setSelectedInspection(ins);
    const roomsData = await inspectionService.getDetails(ins.id);
    const sigData = await inspectionService.getSignatures(ins.id);
    setSelectedInspectionRooms(roomsData);
    setSelectedInspectionSignatures(sigData);
    setView('detail');
    setIsLoading(false);
  }, []);

  const handleCreateInspection = useCallback(
    async (finalStatus: 'rascunho' | 'pendente_assinatura') => {
      if (!newInspector.trim()) {
        alert('Por favor, informe o nome do inspetor.');
        return;
      }

      setIsSubmitting(true);
      const result = await inspectionService.createInspection(
        {
          property_id: property.id.toString(),
          type: newType,
          status: finalStatus,
          inspector_name: newInspector,
          inspection_date: new Date(newDate).toISOString(),
          visibility: newVisibility,
        },
        newRooms
      );

      setIsSubmitting(false);

      if (result) {
        alert(
          finalStatus === 'rascunho'
            ? 'Vistoria salva como Rascunho!'
            : 'Vistoria criada e aguardando assinaturas!'
        );
        setView('list');
        loadInspections();
        // Reset form
        setNewInspector('');
        setNewGeneralNotes('');
        setNewPendingItems('');
        setNewRooms(
          ROOM_TEMPLATES.map((name) => ({
            room_name: name,
            condition: 'bom' as RoomCondition,
            notes: '',
            photos: [],
            videos: [],
          }))
        );
      } else {
        alert('Erro ao salvar vistoria. Verifique os dados e tente novamente.');
      }
    },
    [newInspector, newType, newDate, newVisibility, newRooms, property.id, loadInspections]
  );

  const handlePhotoUpload = useCallback(
    async (roomName: string, files: FileList) => {
      const targetRoom = newRooms.find((r) => r.room_name === roomName);
      if (!targetRoom) return;

      if (targetRoom.photos.length + files.length > 5) {
        alert('Limite máximo de 5 fotos por cômodo atingido.');
        return;
      }

      setUploadingRoom(roomName);

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.size > 5 * 1024 * 1024) {
          alert(`O arquivo ${file.name} excede o limite máximo de 5MB.`);
          continue;
        }

        const fileExt = file.name.split('.').pop()?.toLowerCase();
        if (!['jpg', 'jpeg', 'png', 'heic'].includes(fileExt || '')) {
          alert(`Formato de arquivo não suportado: ${file.name}`);
          continue;
        }

        const filename = `${Math.random().toString(36).substring(2)}.${fileExt}`;
        const path = `inspections/${property.id}/${roomName}/${filename}`;

        let publicUrl = '';
        const { error: uploadError } = await supabase.storage
          .from('inspection-photos')
          .upload(path, file);

        if (uploadError) {
          console.warn('Storage upload failed, falling back to local object URL:', uploadError);
          publicUrl = URL.createObjectURL(file);
        } else {
          const {
            data: { publicUrl: url },
          } = supabase.storage.from('inspection-photos').getPublicUrl(path);
          publicUrl = url;
        }

        setNewRooms((prev) =>
          prev.map((r) => {
            if (r.room_name === roomName) {
              return { ...r, photos: [...r.photos, publicUrl] };
            }
            return r;
          })
        );
      }

      setUploadingRoom(null);
    },
    [newRooms, property.id]
  );

  const handleRemovePhoto = useCallback((roomName: string, photoUrl: string) => {
    setNewRooms((prev) =>
      prev.map((r) => {
        if (r.room_name === roomName) {
          return { ...r, photos: r.photos.filter((p) => p !== photoUrl) };
        }
        return r;
      })
    );
  }, []);

  const getVideoMetadata = (
    file: File
  ): Promise<{ duration: number; width: number; height: number }> =>
    new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        URL.revokeObjectURL(video.src);
        resolve({ duration: video.duration, width: video.videoWidth, height: video.videoHeight });
      };
      video.onerror = () => {
        URL.revokeObjectURL(video.src);
        reject(new Error('Falha ao ler metadados do vídeo'));
      };
      video.src = URL.createObjectURL(file);
    });

  const handleVideoUpload = useCallback(
    async (roomName: string, files: FileList) => {
      const targetRoom = newRooms.find((r) => r.room_name === roomName);
      if (!targetRoom) return;

      if (targetRoom.videos.length + files.length > 3) {
        alert('Limite máximo de 3 vídeos por cômodo atingido.');
        return;
      }

      setUploadingVideoRoom(roomName);

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        if (file.size > 50 * 1024 * 1024) {
          alert(`O vídeo ${file.name} excede o limite máximo de 50MB.`);
          continue;
        }

        const fileExt = file.name.split('.').pop()?.toLowerCase();
        if (!['mp4', 'webm', 'mov'].includes(fileExt || '')) {
          alert(`Formato de vídeo não suportado: ${file.name}. Use MP4, WebM ou MOV.`);
          continue;
        }

        try {
          const metadata = await getVideoMetadata(file);
          if (metadata.duration > 120) {
            alert(
              `O vídeo ${file.name} excede 2 minutos de duração (${Math.round(metadata.duration)}s).`
            );
            continue;
          }
          if (metadata.width > 1920 || metadata.height > 1080) {
            alert(`O vídeo ${file.name} excede resolução Full HD (1920x1080).`);
            continue;
          }
        } catch {
          alert(`Não foi possível validar o vídeo ${file.name}.`);
          continue;
        }

        const filename = `${crypto.randomUUID()}.${fileExt}`;
        const path = `inspections/${property.id}/${roomName}/videos/${filename}`;

        let publicUrl = '';
        const { error: uploadError } = await supabase.storage
          .from('inspection-photos')
          .upload(path, file);

        if (uploadError) {
          console.warn('Storage upload failed, falling back to local object URL:', uploadError);
          publicUrl = URL.createObjectURL(file);
        } else {
          const {
            data: { publicUrl: url },
          } = supabase.storage.from('inspection-photos').getPublicUrl(path);
          publicUrl = url;
        }

        setNewRooms((prev) =>
          prev.map((r) => {
            if (r.room_name === roomName) {
              return { ...r, videos: [...r.videos, publicUrl] };
            }
            return r;
          })
        );
      }

      setUploadingVideoRoom(null);
    },
    [newRooms, property.id]
  );

  const handleRemoveVideo = useCallback((roomName: string, videoUrl: string) => {
    setNewRooms((prev) =>
      prev.map((r) => {
        if (r.room_name === roomName) {
          return { ...r, videos: r.videos.filter((v) => v !== videoUrl) };
        }
        return r;
      })
    );
  }, []);

  const handleOpenSignature = useCallback((type: SignerType) => {
    setSignerType(type);
    setSignName('');
    setSignCpf('');
    setShowSignModal(true);
  }, []);

  const handleSignInspection = useCallback(async () => {
    if (!selectedInspection) return;
    if (!signName.trim() || !signCpf.trim()) {
      alert('Por favor, informe o nome e o CPF para assinar.');
      return;
    }

    setIsSubmitting(true);
    const signatureData = `Nome: ${signName} | CPF: ${signCpf} | IP: 127.0.0.1 (Autenticado)`;

    const nextStatus = signerType === 'owner' ? 'concluída' : 'pendente_assinatura';

    const success = await inspectionService.addSignature(
      selectedInspection.id,
      signerType,
      signatureData,
      nextStatus
    );

    setIsSubmitting(false);
    setShowSignModal(false);

    if (success) {
      alert('Documento assinado eletronicamente com sucesso!');
      fetchInspectionDetails(selectedInspection);
      loadInspections();
    } else {
      alert('Erro ao assinar a vistoria.');
    }
  }, [selectedInspection, signName, signCpf, signerType, fetchInspectionDetails, loadInspections]);

  const handleComparison = useCallback(async () => {
    if (selectedForComparison.length !== 2) return;
    setIsLoading(true);

    const ins1 = inspections.find((i) => i.id === selectedForComparison[0]) || null;
    const ins2 = inspections.find((i) => i.id === selectedForComparison[1]) || null;

    setCompareIns1(ins1);
    setCompareIns2(ins2);

    if (ins1 && ins2) {
      const rooms1 = await inspectionService.getDetails(ins1.id);
      const rooms2 = await inspectionService.getDetails(ins2.id);
      setCompareRooms1(rooms1);
      setCompareRooms2(rooms2);
      setView('compare');
    }

    setIsLoading(false);
  }, [selectedForComparison, inspections]);

  const toggleSelectForComparison = useCallback((id: string) => {
    setSelectedForComparison((prev) => {
      if (prev.includes(id)) {
        return prev.filter((x) => x !== id);
      }
      if (prev.length >= 2) {
        return [prev[1], id];
      }
      return [...prev, id];
    });
  }, []);

  return {
    view,
    setView,
    inspections,
    setInspections,
    selectedInspection,
    setSelectedInspection,
    selectedInspectionRooms,
    setSelectedInspectionRooms,
    selectedInspectionSignatures,
    setSelectedInspectionSignatures,
    selectedForComparison,
    setSelectedForComparison,
    compareRooms1,
    setCompareRooms1,
    compareRooms2,
    setCompareRooms2,
    compareIns1,
    setCompareIns1,
    compareIns2,
    setCompareIns2,
    isLoading,
    setIsLoading,
    isSubmitting,
    setIsSubmitting,
    uploadingRoom,
    setUploadingRoom,
    uploadingVideoRoom,
    setUploadingVideoRoom,
    newType,
    setNewType,
    newDate,
    setNewDate,
    newInspector,
    setNewInspector,
    newVisibility,
    setNewVisibility,
    newRooms,
    setNewRooms,
    expandedRoom,
    setExpandedRoom,
    newGeneralNotes,
    setNewGeneralNotes,
    newPendingItems,
    setNewPendingItems,
    showSignModal,
    setShowSignModal,
    signName,
    setSignName,
    signCpf,
    setSignCpf,
    signerType,
    setSignerType,
    loadInspections,
    fetchInspectionDetails,
    handleCreateInspection,
    handlePhotoUpload,
    handleRemovePhoto,
    handleVideoUpload,
    handleRemoveVideo,
    handleOpenSignature,
    handleSignInspection,
    handleComparison,
    toggleSelectForComparison,
  };
};

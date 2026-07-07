import React, { useState, useRef, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import {
  MapPin,
  ChevronDown,
  ArrowRight,
  UploadCloud,
  BedDouble,
  Bath,
  Car,
  Home,
  DollarSign,
  FileText,
  Loader2,
  X,
  Image as ImageIcon,
  Search,
  Plus,
  Droplets,
  Zap,
  Gauge,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { storageService } from '../../services/storageService';
import { useNotification } from '../../context/NotificationContext';

// ─── Zod Schema ───────────────────────────────────────────────────────────────
const propertySchema = z.object({
  nickname: z.string().min(3, 'O apelido deve ter pelo menos 3 caracteres'),
  type: z.string().min(1, 'Selecione o tipo de imóvel'),
  cep: z.string().min(8, 'CEP inválido'),
  street: z.string().min(1, 'Endereço é obrigatório'),
  number: z.string().min(1, 'Número é obrigatório'),
  complement: z.string().optional(),
  neighborhood: z.string().min(1, 'Bairro é obrigatório'),
  city: z.string().min(1, 'Cidade é obrigatória'),
  state: z.string().min(2, 'Estado é obrigatório'),
  area: z.string().optional(),
  bedrooms: z.number().min(0),
  bathrooms: z.number().min(0),
  parking: z.number().min(0),
  rentValue: z.string().min(1, 'Valor do aluguel é obrigatório'),
  condoValue: z.string().optional(),
  iptuValue: z.string().optional(),
  description: z.string().optional(),
  coverImage: z.string().nullable().optional(),
  galleryImages: z.array(z.string()).optional(),
  // ── Medidores ──────────────────────────────────────────────────────────────
  waterReadingInitial: z
    .number({ error: 'Informe um número válido' })
    .nonnegative('Deve ser positivo')
    .optional(),
  electricityReadingInitial: z
    .number({ error: 'Informe um número válido' })
    .nonnegative('Deve ser positivo')
    .optional(),
  waterMeterPhoto: z.string().url().optional().or(z.literal('')),
  electricityMeterPhoto: z.string().url().optional().or(z.literal('')),
});

type PropertyFormData = z.infer<typeof propertySchema>;

interface AddPropertyFormProps {
  onClose: () => void;
  onSave: (data: any) => void;
  initialData?: any;
}

// ─── Meter Photo Upload Widget ─────────────────────────────────────────────────
interface MeterPhotoUploadProps {
  label: string;
  icon: React.ReactNode;
  accentClass: string;
  preview: string | null;
  onFile: (file: File) => void;
  onClear: () => void;
  uploading?: boolean;
}

const MeterPhotoUpload: React.FC<MeterPhotoUploadProps> = React.memo(
  ({ label, icon, accentClass, preview, onFile, onClear, uploading = false }) => {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) onFile(file);
    };

    return (
      <div className='space-y-2'>
        <label
          className={`text-xs font-black uppercase tracking-widest flex items-center gap-1.5 ${accentClass}`}
        >
          {icon}
          {label}
        </label>
        <div
          onClick={() => !uploading && inputRef.current?.click()}
          className={`relative w-full h-36 rounded-2xl border-2 border-dashed transition-all cursor-pointer overflow-hidden group ${
            preview
              ? 'border-transparent'
              : `border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 hover:border-primary hover:bg-primary/5`
          }`}
        >
          {preview ? (
            <>
              <img src={preview} alt='Preview medidor' className='w-full h-full object-cover' />
              <div className='absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity'>
                <UploadCloud size={22} className='text-white' />
              </div>
              <button
                type='button'
                onClick={(e) => {
                  e.stopPropagation();
                  onClear();
                }}
                className='absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-95 z-10'
              >
                <X size={12} />
              </button>
            </>
          ) : (
            <div className='flex flex-col items-center justify-center h-full text-slate-400 group-hover:text-primary transition-colors gap-2'>
              {uploading ? (
                <Loader2 size={22} className='animate-spin text-primary' />
              ) : (
                <>
                  {icon}
                  <span className='text-[10px] font-bold text-center px-4'>
                    Clique para anexar foto do medidor
                  </span>
                </>
              )}
            </div>
          )}
          <input
            ref={inputRef}
            type='file'
            className='hidden'
            accept='image/*'
            onChange={handleChange}
          />
        </div>
      </div>
    );
  }
);

// ─── Main Component ────────────────────────────────────────────────────────────
export const AddPropertyForm: React.FC<AddPropertyFormProps> = ({
  onClose,
  onSave,
  initialData,
}) => {
  const { addToast } = useNotification();

  const [loadingCep, setLoadingCep] = useState(false);
  const [coverImage, setCoverImage] = useState<string | null>(initialData?.coverImage || null);
  const [galleryImages, setGalleryImages] = useState<string[]>(initialData?.galleryImages || []);

  // ── Meter photo state ────────────────────────────────────────────────────────
  const [waterMeterFile, setWaterMeterFile] = useState<File | null>(null);
  const [waterMeterPreview, setWaterMeterPreview] = useState<string | null>(null);
  const [electricityMeterFile, setElectricityMeterFile] = useState<File | null>(null);
  const [electricityMeterPreview, setElectricityMeterPreview] = useState<string | null>(null);
  const [uploadingWater, setUploadingWater] = useState(false);
  const [uploadingElectricity, setUploadingElectricity] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      bedrooms: initialData?.bedrooms ?? 1,
      bathrooms: initialData?.bathrooms ?? 1,
      parking: initialData?.parking ?? 0,
      ...initialData,
    },
  });

  const bedrooms = watch('bedrooms');
  const bathrooms = watch('bathrooms');
  const parking = watch('parking');

  // ── Helpers ──────────────────────────────────────────────────────────────────
  const handleCounter = useCallback(
    (field: 'bedrooms' | 'bathrooms' | 'parking', operation: 'inc' | 'dec') => {
      const currentValue = Number(getValues(field)) || 0;
      const newValue = operation === 'inc' ? currentValue + 1 : Math.max(0, currentValue - 1);
      setValue(field, newValue, { shouldValidate: true, shouldDirty: true });
    },
    [getValues, setValue]
  );

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleGalleryUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setGalleryImages((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const removeGalleryImage = useCallback((index: number) => {
    setGalleryImages((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // ── Meter photo handlers ──────────────────────────────────────────────────────
  const handleMeterFile = useCallback(
    (
      file: File,
      setFile: React.Dispatch<React.SetStateAction<File | null>>,
      setPreview: React.Dispatch<React.SetStateAction<string | null>>
    ) => {
      setFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    },
    []
  );

  // ── CEP / currency ────────────────────────────────────────────────────────────
  const formatCEP = useCallback(
    (value: string) =>
      value
        .replace(/\D/g, '')
        .replace(/(\d{5})(\d)/, '$1-$2')
        .slice(0, 9),
    []
  );

  const formatCurrency = useCallback((value: string) => {
    const cleanValue = value.replace(/\D/g, '');
    const numberValue = Number(cleanValue) / 100;
    return numberValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }, []);

  const handleCEPChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setValue('cep', formatCEP(e.target.value));
    },
    [setValue, formatCEP]
  );

  const handleCurrencyChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>, field: 'rentValue' | 'condoValue' | 'iptuValue') => {
      setValue(field, formatCurrency(e.target.value));
    },
    [setValue, formatCurrency]
  );

  const fetchCep = useCallback(async () => {
    const cep = getValues('cep');
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) return;
    setLoadingCep(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await response.json();
      if (!data.erro) {
        setValue('street', data.logradouro);
        setValue('neighborhood', data.bairro);
        setValue('city', data.localidade);
        setValue('state', data.uf);
      }
    } catch {
      console.error('Erro ao buscar CEP');
    } finally {
      setLoadingCep(false);
    }
  }, [getValues, setValue]);

  // ── Submit ────────────────────────────────────────────────────────────────────
  const onSubmit = async (data: PropertyFormData) => {
    const parseCurrency = (val?: string) => {
      if (!val) return 0;
      return Number(val.replace(/\D/g, '')) / 100;
    };

    // Upload meter photos (non-blocking on individual failure)
    let waterMeterPhotoUrl: string | null = null;
    let electricityMeterPhotoUrl: string | null = null;

    if (waterMeterFile) {
      setUploadingWater(true);
      try {
        const ext = waterMeterFile.name.split('.').pop();
        const fileName = `water/${crypto.randomUUID()}.${ext}`;
        waterMeterPhotoUrl = await storageService.uploadFile(
          'property-meters',
          fileName,
          waterMeterFile
        );
        if (!waterMeterPhotoUrl) throw new Error('URL nula');
      } catch {
        addToast(
          'Aviso',
          'Não foi possível enviar a foto do medidor de água. Os dados numéricos serão salvos.',
          'error'
        );
      } finally {
        setUploadingWater(false);
      }
    }

    if (electricityMeterFile) {
      setUploadingElectricity(true);
      try {
        const ext = electricityMeterFile.name.split('.').pop();
        const fileName = `electricity/${crypto.randomUUID()}.${ext}`;
        electricityMeterPhotoUrl = await storageService.uploadFile(
          'property-meters',
          fileName,
          electricityMeterFile
        );
        if (!electricityMeterPhotoUrl) throw new Error('URL nula');
      } catch {
        addToast(
          'Aviso',
          'Não foi possível enviar a foto do medidor de luz. Os dados numéricos serão salvos.',
          'error'
        );
      } finally {
        setUploadingElectricity(false);
      }
    }

    const payload = {
      ...data,
      rentValue: parseCurrency(data.rentValue).toString(),
      condoValue: data.condoValue ? parseCurrency(data.condoValue).toString() : undefined,
      iptuValue: data.iptuValue ? parseCurrency(data.iptuValue).toString() : undefined,
      coverImage,
      galleryImages,
      // snake_case mapping for DB
      water_reading_initial: data.waterReadingInitial ?? null,
      electricity_reading_initial: data.electricityReadingInitial ?? null,
      water_meter_photo_url: waterMeterPhotoUrl,
      electricity_meter_photo_url: electricityMeterPhotoUrl,
    };

    onSave(payload as any);
  };

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className='max-h-[90vh] overflow-y-auto p-0 gap-0 md:max-w-3xl'
        showCloseButton={true}
      >
        <DialogHeader className='px-6 py-4 border-b border-border flex-shrink-0'>
          <DialogTitle className='text-xl font-bold'>
            {initialData ? 'Editar Imóvel' : 'Novo Imóvel'}
          </DialogTitle>
          <DialogDescription />
        </DialogHeader>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className='flex flex-col h-full overflow-hidden bg-background text-foreground'
        >
          <div className='flex-1 overflow-y-auto'>
            {/* 1. Mídia / Capa */}
            <div className='p-6 pb-2 grid grid-cols-1 md:grid-cols-3 gap-6'>
              <div className='md:col-span-1'>
                <label className='text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 block'>
                  Foto de Capa
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative w-full aspect-square md:aspect-auto md:h-40 rounded-2xl border-2 border-dashed transition-all cursor-pointer overflow-hidden group ${
                    coverImage
                      ? 'border-transparent'
                      : 'border-slate-300 dark:border-gray-700 bg-slate-50 dark:bg-white/5 hover:border-primary hover:bg-primary/5'
                  }`}
                >
                  {coverImage ? (
                    <>
                      <img src={coverImage} alt='Preview' className='w-full h-full object-cover' />
                      <button
                        type='button'
                        onClick={(e) => {
                          e.stopPropagation();
                          setCoverImage(null);
                        }}
                        className='absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-95 z-10'
                      >
                        <X size={14} />
                      </button>
                      <div className='absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity'>
                        <span className='text-white font-bold flex items-center gap-2'>
                          <UploadCloud size={20} />
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className='flex flex-col items-center justify-center h-full text-slate-400 group-hover:text-primary transition-colors p-4'>
                      <ImageIcon size={24} />
                      <span className='text-[10px] font-bold mt-2 text-center'>
                        Clique para adicionar capa
                      </span>
                    </div>
                  )}
                  <input
                    type='file'
                    ref={fileInputRef}
                    className='hidden'
                    accept='image/*'
                    onChange={handleImageUpload}
                  />
                </div>
              </div>

              <div className='md:col-span-2'>
                <label className='text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 block'>
                  Fotos dos Ambientes
                </label>
                <div className='grid grid-cols-3 sm:grid-cols-4 gap-2'>
                  {galleryImages.map((img, idx) => (
                    <div
                      key={idx}
                      className='relative aspect-square rounded-xl overflow-hidden group border border-slate-200 dark:border-white/10'
                    >
                      <img
                        src={img}
                        alt={`Environment ${idx}`}
                        className='w-full h-full object-cover'
                      />
                      <button
                        type='button'
                        onClick={(e) => {
                          e.stopPropagation();
                          removeGalleryImage(idx);
                        }}
                        className='absolute top-1 right-1 p-1 bg-red-500 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity'
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}

                  {Array.from({ length: bedrooms }).map((_, i) => (
                    <button
                      key={`bed-slot-${i}`}
                      type='button'
                      onClick={() => galleryInputRef.current?.click()}
                      className='aspect-square rounded-xl border-2 border-dashed border-slate-200 dark:border-gray-800 flex flex-col items-center justify-center text-slate-400 hover:border-primary hover:text-primary transition-all bg-slate-50/50 dark:bg-white/5 group'
                    >
                      <BedDouble size={18} className='group-hover:scale-110 transition-transform' />
                      <span className='text-[7px] font-black mt-1 uppercase tracking-tighter'>
                        Quarto {i + 1}
                      </span>
                    </button>
                  ))}

                  {Array.from({ length: bathrooms }).map((_, i) => (
                    <button
                      key={`bath-slot-${i}`}
                      type='button'
                      onClick={() => galleryInputRef.current?.click()}
                      className='aspect-square rounded-xl border-2 border-dashed border-slate-200 dark:border-gray-800 flex flex-col items-center justify-center text-slate-400 hover:border-primary hover:text-primary transition-all bg-slate-50/50 dark:bg-white/5 group'
                    >
                      <Bath size={18} className='group-hover:scale-110 transition-transform' />
                      <span className='text-[7px] font-black mt-1 uppercase tracking-tighter'>
                        Banheiro {i + 1}
                      </span>
                    </button>
                  ))}

                  <button
                    type='button'
                    onClick={() => galleryInputRef.current?.click()}
                    className='aspect-square rounded-xl border-2 border-dashed border-slate-200 dark:border-gray-800 flex flex-col items-center justify-center text-slate-400 hover:border-primary hover:text-primary transition-all bg-slate-50/50 dark:bg-white/5 group'
                  >
                    <Plus size={18} className='group-hover:rotate-90 transition-transform' />
                    <span className='text-[7px] font-black mt-1 uppercase tracking-tighter'>
                      Sala/Outros
                    </span>
                  </button>

                  <input
                    type='file'
                    ref={galleryInputRef}
                    className='hidden'
                    accept='image/*'
                    multiple
                    onChange={handleGalleryUpload}
                  />
                </div>
              </div>
            </div>

            <div className='p-6 space-y-8'>
              {/* 2. Informações Básicas */}
              <section>
                <h3 className='text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2'>
                  <Home size={14} /> Informações Básicas
                </h3>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <label className='text-sm font-semibold text-slate-700 dark:text-slate-300'>
                      Apelido do Imóvel <span className='text-primary'>*</span>
                    </label>
                    <input
                      {...register('nickname')}
                      className={`w-full px-4 py-3 rounded-xl bg-white dark:bg-surface-dark border ${errors.nickname ? 'border-red-500' : 'border-slate-200 dark:border-white/10'} outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all dark:text-white`}
                      placeholder='Ex: Studio Centro'
                    />
                    {errors.nickname && (
                      <p className='text-xs text-red-500 font-medium'>{errors.nickname.message}</p>
                    )}
                  </div>
                  <div className='space-y-2'>
                    <label className='text-sm font-semibold text-slate-700 dark:text-slate-300'>
                      Tipo de Imóvel <span className='text-primary'>*</span>
                    </label>
                    <div className='relative'>
                      <select
                        {...register('type')}
                        className={`w-full appearance-none px-4 py-3 rounded-xl bg-white dark:bg-surface-dark border ${errors.type ? 'border-red-500' : 'border-slate-200 dark:border-white/10'} outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all dark:text-white`}
                      >
                        <option value='' disabled>
                          Selecione
                        </option>
                        <option value='Apartamento'>Apartamento</option>
                        <option value='Kitnet'>Kitnet</option>
                        <option value='Studio'>Studio</option>
                        <option value='Casa'>Casa</option>
                        <option value='Comercial'>Sala Comercial</option>
                      </select>
                      <ChevronDown
                        className='absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none'
                        size={20}
                      />
                    </div>
                    {errors.type && (
                      <p className='text-xs text-red-500 font-medium'>{errors.type.message}</p>
                    )}
                  </div>
                </div>
              </section>

              <hr className='border-slate-100 dark:border-white/5' />

              {/* 3. Localização */}
              <section>
                <h3 className='text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2'>
                  <MapPin size={14} /> Localização
                </h3>
                <div className='space-y-4'>
                  <div className='flex flex-col md:flex-row gap-4'>
                    <div className='w-full md:w-40 space-y-2'>
                      <label className='text-sm font-semibold text-slate-700 dark:text-slate-300'>
                        CEP
                      </label>
                      <div className='relative'>
                        <input
                          {...register('cep')}
                          onChange={handleCEPChange}
                          onBlur={fetchCep}
                          maxLength={9}
                          className={`w-full pl-4 pr-9 py-3 rounded-xl bg-white dark:bg-surface-dark border ${errors.cep ? 'border-red-500' : 'border-slate-200 dark:border-white/10'} outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all dark:text-white`}
                          placeholder='00000-000'
                        />
                        <div className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none'>
                          {loadingCep ? (
                            <Loader2 size={16} className='animate-spin text-primary' />
                          ) : (
                            <Search size={16} />
                          )}
                        </div>
                      </div>
                      {errors.cep && (
                        <p className='text-xs text-red-500 font-medium'>{errors.cep.message}</p>
                      )}
                    </div>
                    <div className='flex-1 space-y-2'>
                      <label className='text-sm font-semibold text-slate-700 dark:text-slate-300'>
                        Endereço
                      </label>
                      <input
                        {...register('street')}
                        className={`w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-black/20 border ${errors.street ? 'border-red-500' : 'border-slate-200 dark:border-white/5'} outline-none dark:text-white`}
                        placeholder='Rua, Avenida...'
                      />
                      {errors.street && (
                        <p className='text-xs text-red-500 font-medium'>{errors.street.message}</p>
                      )}
                    </div>
                  </div>

                  <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                    <div className='space-y-2'>
                      <label className='text-sm font-semibold text-slate-700 dark:text-slate-300'>
                        Número <span className='text-primary'>*</span>
                      </label>
                      <input
                        {...register('number')}
                        className={`w-full px-4 py-3 rounded-xl bg-white dark:bg-surface-dark border ${errors.number ? 'border-red-500' : 'border-slate-200 dark:border-white/10'} outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all dark:text-white`}
                      />
                      {errors.number && (
                        <p className='text-xs text-red-500 font-medium'>{errors.number.message}</p>
                      )}
                    </div>
                    <div className='md:col-span-1 space-y-2'>
                      <label className='text-sm font-semibold text-slate-700 dark:text-slate-300'>
                        Complemento
                      </label>
                      <input
                        {...register('complement')}
                        className='w-full px-4 py-3 rounded-xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all dark:text-white'
                        placeholder='Apt 101'
                      />
                    </div>
                    <div className='md:col-span-2 space-y-2'>
                      <label className='text-sm font-semibold text-slate-700 dark:text-slate-300'>
                        Bairro
                      </label>
                      <input
                        {...register('neighborhood')}
                        className={`w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-black/20 border ${errors.neighborhood ? 'border-red-500' : 'border-slate-200 dark:border-white/5'} outline-none dark:text-white`}
                      />
                      {errors.neighborhood && (
                        <p className='text-xs text-red-500 font-medium'>
                          {errors.neighborhood.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </section>

              <hr className='border-slate-100 dark:border-white/5' />

              {/* 4. Características */}
              <section>
                <div className='flex items-center justify-between mb-4'>
                  <h3 className='text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2'>
                    <FileText size={14} /> Características
                  </h3>
                  <div className='flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-primary animate-pulse'>
                    <ImageIcon size={12} />
                    <span className='text-[9px] font-black uppercase tracking-widest'>
                      Lembre de subir as fotos
                    </span>
                  </div>
                </div>
                <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                  <div className='space-y-2'>
                    <label className='text-sm font-semibold text-slate-700 dark:text-slate-300'>
                      Área (m²)
                    </label>
                    <input
                      {...register('area')}
                      type='number'
                      className='w-full px-4 py-3 rounded-xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all dark:text-white'
                      placeholder='0'
                    />
                  </div>

                  {[
                    { label: 'Quartos', field: 'bedrooms', icon: BedDouble, value: bedrooms },
                    { label: 'Banheiros', field: 'bathrooms', icon: Bath, value: bathrooms },
                    { label: 'Vagas', field: 'parking', icon: Car, value: parking },
                  ].map((item) => (
                    <div key={item.field} className='space-y-2'>
                      <label className='text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1'>
                        <item.icon size={14} className='text-slate-400' /> {item.label}
                      </label>
                      <div className='flex items-center justify-between bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 rounded-xl px-2 py-2'>
                        <button
                          type='button'
                          onClick={() => handleCounter(item.field as any, 'dec')}
                          className='w-7 h-7 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-white/5 text-slate-500 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors'
                        >
                          -
                        </button>
                        <span className='font-bold text-slate-900 dark:text-white'>
                          {item.value}
                        </span>
                        <button
                          type='button'
                          onClick={() => handleCounter(item.field as any, 'inc')}
                          className='w-7 h-7 flex items-center justify-center rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors'
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className='mt-4 flex items-center gap-2 text-slate-500 dark:text-slate-400'>
                  <div className='w-1 h-1 rounded-full bg-primary'></div>
                  <p className='text-[10px] font-medium'>
                    Cada quarto ou banheiro adicionado gera automaticamente um espaço para foto na
                    seção de mídia.
                  </p>
                </div>
              </section>

              <hr className='border-slate-100 dark:border-white/5' />

              {/* 5. Financeiro */}
              <section>
                <h3 className='text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2'>
                  <DollarSign size={14} /> Composição Financeira
                </h3>
                <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
                  <div className='space-y-2'>
                    <label className='text-sm font-bold text-emerald-600 dark:text-emerald-400'>
                      Aluguel
                    </label>
                    <div className='relative'>
                      <span className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs'>
                        R$
                      </span>
                      <input
                        {...register('rentValue')}
                        onChange={(e) => handleCurrencyChange(e, 'rentValue')}
                        className={`w-full pl-9 pr-3 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/10 border ${errors.rentValue ? 'border-red-500' : 'border-emerald-100 dark:border-emerald-900/30'} outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-bold text-emerald-900 dark:text-emerald-100`}
                        placeholder='0,00'
                      />
                    </div>
                    {errors.rentValue && (
                      <p className='text-xs text-red-500 font-medium'>{errors.rentValue.message}</p>
                    )}
                  </div>
                  <div className='space-y-2'>
                    <label className='text-sm font-semibold text-slate-700 dark:text-slate-300'>
                      Condomínio
                    </label>
                    <div className='relative'>
                      <span className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs'>
                        R$
                      </span>
                      <input
                        {...register('condoValue')}
                        onChange={(e) => handleCurrencyChange(e, 'condoValue')}
                        className='w-full pl-9 pr-3 py-3 rounded-xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 outline-none focus:ring-2 focus:ring-primary/50 transition-all dark:text-white'
                        placeholder='0,00'
                      />
                    </div>
                  </div>
                  <div className='space-y-2'>
                    <label className='text-sm font-semibold text-slate-700 dark:text-slate-300'>
                      IPTU (Mensal)
                    </label>
                    <div className='relative'>
                      <span className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs'>
                        R$
                      </span>
                      <input
                        {...register('iptuValue')}
                        onChange={(e) => handleCurrencyChange(e, 'iptuValue')}
                        className='w-full pl-9 pr-3 py-3 rounded-xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 outline-none focus:ring-2 focus:ring-primary/50 transition-all dark:text-white'
                        placeholder='0,00'
                      />
                    </div>
                  </div>
                </div>
              </section>

              <hr className='border-slate-100 dark:border-white/5' />

              {/* 6. Medidores & Consumo — Framer Motion fade-in + slide-up */}
              <motion.section
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut', delay: 0.15 }}
              >
                {/* Header */}
                <div className='flex items-center justify-between mb-5'>
                  <h3 className='text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2'>
                    <Gauge size={14} /> Medidores &amp; Consumo
                  </h3>
                  <span className='px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-full bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-sky-800/40'>
                    Leitura Inicial
                  </span>
                </div>

                {/* Leitura Numérica */}
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6'>
                  {/* Água */}
                  <div className='space-y-2'>
                    <label className='text-xs font-black uppercase tracking-widest flex items-center gap-1.5 text-sky-600 dark:text-sky-400'>
                      <Droplets size={13} /> Leitura de Água (m³)
                    </label>
                    <div className='relative'>
                      <Droplets
                        size={16}
                        className='absolute left-3 top-1/2 -translate-y-1/2 text-sky-400 pointer-events-none'
                      />
                      <input
                        {...register('waterReadingInitial', { valueAsNumber: true })}
                        type='number'
                        step='0.001'
                        min='0'
                        className={`w-full pl-9 pr-4 py-3 rounded-xl bg-sky-50 dark:bg-sky-900/10 border ${
                          errors.waterReadingInitial
                            ? 'border-red-500'
                            : 'border-sky-100 dark:border-sky-900/30'
                        } outline-none focus:ring-2 focus:ring-sky-400/40 focus:border-sky-400 transition-all dark:text-white font-mono`}
                        placeholder='0,000'
                      />
                    </div>
                    {errors.waterReadingInitial && (
                      <p className='text-xs text-red-500 font-medium'>
                        {errors.waterReadingInitial.message}
                      </p>
                    )}
                  </div>

                  {/* Luz */}
                  <div className='space-y-2'>
                    <label className='text-xs font-black uppercase tracking-widest flex items-center gap-1.5 text-amber-600 dark:text-amber-400'>
                      <Zap size={13} /> Leitura de Luz (kWh)
                    </label>
                    <div className='relative'>
                      <Zap
                        size={16}
                        className='absolute left-3 top-1/2 -translate-y-1/2 text-amber-400 pointer-events-none'
                      />
                      <input
                        {...register('electricityReadingInitial', { valueAsNumber: true })}
                        type='number'
                        step='0.01'
                        min='0'
                        className={`w-full pl-9 pr-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-900/10 border ${
                          errors.electricityReadingInitial
                            ? 'border-red-500'
                            : 'border-amber-100 dark:border-amber-900/30'
                        } outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition-all dark:text-white font-mono`}
                        placeholder='0,00'
                      />
                    </div>
                    {errors.electricityReadingInitial && (
                      <p className='text-xs text-red-500 font-medium'>
                        {errors.electricityReadingInitial.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Fotos dos Medidores */}
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                  <MeterPhotoUpload
                    label='Água'
                    accentClass='text-blue-500'
                    icon={<Droplets size={14} />}
                    preview={waterMeterPreview}
                    onFile={(file) =>
                      handleMeterFile(file, setWaterMeterFile, setWaterMeterPreview)
                    }
                    onClear={() => {
                      setWaterMeterFile(null);
                      setWaterMeterPreview(null);
                    }}
                    uploading={uploadingWater}
                  />
                  <MeterPhotoUpload
                    label='Luz'
                    accentClass='text-amber-500'
                    icon={<Zap size={14} />}
                    preview={electricityMeterPreview}
                    onFile={(file) =>
                      handleMeterFile(file, setElectricityMeterFile, setElectricityMeterPreview)
                    }
                    onClear={() => {
                      setElectricityMeterFile(null);
                      setElectricityMeterPreview(null);
                    }}
                    uploading={uploadingElectricity}
                  />
                </div>

                {/* Disclaimer */}
                <div className='mt-4 p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 flex items-start gap-2 text-slate-500 dark:text-slate-400'>
                  <div className='w-1 h-1 rounded-full bg-primary mt-1.5 shrink-0'></div>
                  <p className='text-[10px] font-medium leading-relaxed'>
                    As leituras iniciais são essenciais para o cálculo automático de rateio de
                    consumo. As fotos comprobatórias eliminam disputas entre proprietário e
                    inquilino na entrada do imóvel.
                  </p>
                </div>
              </motion.section>

              <div className='h-4'></div>
            </div>
          </div>

          {/* Footer */}
          <div className='flex-none p-6 pt-4 bg-background-light dark:bg-background-dark border-t border-slate-200 dark:border-white/5 z-20 flex gap-3'>
            <button
              type='button'
              onClick={onClose}
              className='flex-1 h-12 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 font-bold text-sm hover:bg-slate-200 dark:hover:bg-white/10 transition-colors'
            >
              Cancelar
            </button>
            <button
              type='submit'
              disabled={isSubmitting}
              className='flex-[2] group h-12 flex items-center justify-center rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-sm shadow-lg shadow-primary/25 active:scale-[0.98] transition-all duration-200 disabled:opacity-50'
            >
              {isSubmitting ? (
                <Loader2 size={20} className='animate-spin' />
              ) : (
                <>
                  {initialData ? 'Salvar Alterações' : 'Cadastrar Imóvel'}
                  <ArrowRight
                    className='ml-2 group-hover:translate-x-1 transition-transform'
                    size={18}
                  />
                </>
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

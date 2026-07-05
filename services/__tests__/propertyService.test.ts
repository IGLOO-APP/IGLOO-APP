import { describe, it, expect, vi, beforeEach } from 'vitest';
import { propertyService } from '../propertyService';

const mockSelect = vi.fn();
const mockEq = vi.fn();
const mockSingle = vi.fn();
const mockFrom = vi.fn();

vi.mock('../../lib/supabase', () => ({
  supabase: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    from: (...args: any[]) => mockFrom(...args),
  },
}));

const mockMapProperty = vi.fn();
vi.mock('../../utils/mappingUtils', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mapProperty: (...args: any[]) => mockMapProperty(...args),
}));

vi.mock('../../lib/utils', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleServiceError: vi.fn((error: any) => {
    throw error;
  }),
}));

beforeEach(() => {
  vi.clearAllMocks();
  mockFrom.mockReturnValue({ select: mockSelect });
  mockSelect.mockReturnValue({ eq: mockEq });
  mockEq.mockReturnValue({ single: mockSingle });
});

describe('propertyService.getById', () => {
  it('should return a property when found', async () => {
    const mockRow = { id: '1', name: 'Apto 101', status: 'ALUGADO', price: 1500 };
    const mappedProperty = { id: '1', name: 'Apto 101', status: 'ALUGADO' };

    mockSingle.mockResolvedValue({ data: mockRow, error: null });
    mockMapProperty.mockReturnValue(mappedProperty);

    const result = await propertyService.getById('1');

    expect(mockFrom).toHaveBeenCalledWith('properties');
    expect(mockSelect).toHaveBeenCalled();
    expect(mockEq).toHaveBeenCalledWith('id', '1');
    expect(mockMapProperty).toHaveBeenCalledWith(mockRow);
    expect(result).toEqual(mappedProperty);
  });

  it('should return null when property is not found (PGRST116)', async () => {
    mockSingle.mockResolvedValue({
      data: null,
      error: { code: 'PGRST116', message: 'Not found' },
    });

    const result = await propertyService.getById('nonexistent');

    expect(result).toBeNull();
  });

  it('should throw on other errors', async () => {
    const testError = { code: 'OTHER', message: 'Database error' };
    mockSingle.mockResolvedValue({ data: null, error: testError });

    await expect(propertyService.getById('1')).rejects.toThrow(testError);
  });
});

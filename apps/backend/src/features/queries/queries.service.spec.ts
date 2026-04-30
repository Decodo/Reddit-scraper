import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { QueriesService } from './queries.service';
import { Query } from './queries.schema';
import type { ScrapingPlan, RedditReport } from '../llm/llm.types';
import type { RedditPost } from '../decodo/decodo.types';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const mockDoc = {
  _id: 'doc-123',
  prompt: 'test prompt',
  plan: {} as ScrapingPlan,
  posts: [] as RedditPost[],
  report: {} as RedditReport,
  createdAt: new Date(),
};

const mockCreateDto = {
  prompt: 'test prompt',
  plan: {
    subreddits: ['programming'],
    queries: ['test query'],
    timeRange: 'week' as const,
    rationale: 'Because tests',
  },
  posts: [] as RedditPost[],
  report: {
    executiveSummary: 'Summary',
    themes: [],
    sentiment: { overall: 'neutral' as const, rationale: '' },
    notableQuotes: [],
    topPosts: [],
  },
};

// ---------------------------------------------------------------------------
// Model mock factory
// ---------------------------------------------------------------------------

function buildModelMock() {
  const MockModel = jest.fn().mockImplementation(() => ({
    save: jest.fn().mockResolvedValue(mockDoc),
  })) as jest.Mock & {
    find: jest.Mock;
    findById: jest.Mock;
    findByIdAndDelete: jest.Mock;
  };

  MockModel.find = jest.fn().mockReturnValue({
    select: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue([mockDoc]),
  });

  MockModel.findById = jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue(mockDoc),
  });

  MockModel.findByIdAndDelete = jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue(mockDoc),
  });

  return MockModel;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('QueriesService', () => {
  let service: QueriesService;
  let MockModel: ReturnType<typeof buildModelMock>;

  beforeEach(async () => {
    MockModel = buildModelMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [QueriesService, { provide: getModelToken(Query.name), useValue: MockModel }],
    }).compile();

    service = module.get<QueriesService>(QueriesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ---------------------------------------------------------------------------
  // create()
  // ---------------------------------------------------------------------------

  describe('create()', () => {
    it('creates a new document and saves it', async () => {
      const result = await service.create(mockCreateDto);

      expect(MockModel).toHaveBeenCalledWith(mockCreateDto);
      expect(result).toBe(mockDoc);
    });
  });

  // ---------------------------------------------------------------------------
  // findAll()
  // ---------------------------------------------------------------------------

  describe('findAll()', () => {
    it('calls find() with no filter argument', async () => {
      await service.findAll();

      expect(MockModel.find).toHaveBeenCalledWith();
    });

    it('calls .select("-posts") to exclude the posts field', async () => {
      await service.findAll();

      const chainMock = MockModel.find.mock.results[0].value;
      expect(chainMock.select).toHaveBeenCalledWith('-posts');
    });

    it('calls .sort({ createdAt: -1 }) for newest first', async () => {
      await service.findAll();

      const chainMock = MockModel.find.mock.results[0].value;
      expect(chainMock.sort).toHaveBeenCalledWith({ createdAt: -1 });
    });

    it('returns the array of documents', async () => {
      const result = await service.findAll();
      expect(result).toEqual([mockDoc]);
    });
  });

  // ---------------------------------------------------------------------------
  // findOne()
  // ---------------------------------------------------------------------------

  describe('findOne()', () => {
    it('returns document when found', async () => {
      const result = await service.findOne('doc-123');

      expect(MockModel.findById).toHaveBeenCalledWith('doc-123');
      expect(result).toBe(mockDoc);
    });

    it('throws NotFoundException when document is null', async () => {
      MockModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  // ---------------------------------------------------------------------------
  // remove()
  // ---------------------------------------------------------------------------

  describe('remove()', () => {
    it('resolves without error when document is found and deleted', async () => {
      await expect(service.remove('doc-123')).resolves.toBeUndefined();
      expect(MockModel.findByIdAndDelete).toHaveBeenCalledWith('doc-123');
    });

    it('throws NotFoundException when document is null', async () => {
      MockModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.remove('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });
});

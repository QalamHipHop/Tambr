import { Test, TestingModule } from '@nestjs/testing';
import { OracleService } from '../services/oracle.service';
import { getModelToken } from '@nestjs/mongoose';

describe('OracleService', () => {
  let service: OracleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OracleService,
        {
          provide: getModelToken('OracleUpdate'),
          useValue: {
            // Mock the Mongoose model methods used by the service
            create: jest.fn(),
            find: jest.fn().mockResolvedValue([]),
          },
        },
      ],
    }).compile();

    service = module.get<OracleService>(OracleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

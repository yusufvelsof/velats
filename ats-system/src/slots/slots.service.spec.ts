import { Test, TestingModule } from '@nestjs/testing';
import { SlotsService } from './slots.service';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';

describe('SlotsService', () => {
  let service: SlotsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SlotsService,
        {
          provide: PrismaService,
          useValue: {},
        },
        {
          provide: EmailService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<SlotsService>(SlotsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

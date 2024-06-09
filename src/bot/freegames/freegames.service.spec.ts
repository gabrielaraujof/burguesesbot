import { Test, TestingModule } from '@nestjs/testing';
import { FreegamesService } from './freegames.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

describe('FreegamesService', () => {
  let service: FreegamesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FreegamesService,
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(() => ''),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(() => 'config'),
          },
        },
      ],
    }).compile();

    service = module.get<FreegamesService>(FreegamesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { TriviaService } from './trivia.service';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';

describe('TriviaService', () => {
  let service: TriviaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TriviaService,
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(() => of('')),
          },
        },
      ],
    }).compile();

    service = module.get<TriviaService>(TriviaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

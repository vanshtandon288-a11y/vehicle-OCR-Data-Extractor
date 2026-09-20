import { Test, TestingModule } from '@nestjs/testing';
import { ExtractionService } from './extraction.service';
import { DocumentType } from '../../database/entities/document.entity';

describe('ExtractionService', () => {
  let service: ExtractionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExtractionService],
    }).compile();

    service = module.get<ExtractionService>(ExtractionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should extract RC document fields correctly', () => {
    const sampleRCText = `
      REGISTRATION CERTIFICATE
      REGN NO: MH12AB1234
      CHASSIS NO: MA3EWB21S00123456
      ENGINE NO: K10BN1234567
      REGISTERING AUTHORITY: PUNE
    `;

    const result = service.extractData(DocumentType.RC, sampleRCText);
    expect(result.registrationNumber).toBe('MH12AB1234');
    expect(result.chassisNumber).toBe('MA3EWB21S00123456');
    expect(result.engineNumber).toBe('K10BN1234567');
    expect(result.isRegistrationValid).toBe(true);
    expect(result.isChassisValid).toBe(true);
    expect(result.isEngineValid).toBe(true);
  });

  it('should extract Insurance document fields correctly', () => {
    const sampleInsuranceText = `
      MOTOR VEHICLE INSURANCE POLICY
      POLICY NO: OG-24-1234-1801-00001234
      VALID UPTO: 04-Feb-2026
    `;

    const result = service.extractData(DocumentType.INSURANCE, sampleInsuranceText);
    expect(result.insuranceNumber).toBe('OG241234180100001234');
    expect(result.insuranceExpiryDate).toBe('2026/02/04');
    expect(result.isInsuranceNumberValid).toBe(true);
  });

  it('should extract PUC document fields correctly', () => {
    const samplePUCText = `
      POLLUTION UNDER CONTROL CERTIFICATE
      CERTIFICATE NO: PUC12345678
      VALID TILL: 15/08/2026
    `;

    const result = service.extractData(DocumentType.PUC, samplePUCText);
    expect(result.pucNumber).toBe('PUC12345678');
    expect(result.pucExpiryDate).toBe('2026/08/15');
    expect(result.isPucNumberValid).toBe(true);
  });

  it('should extract Permit document fields correctly', () => {
    const samplePermitText = `
      GOODS CARRIAGE PERMIT
      PERMIT NO: KA2022PER1234
      VALIDITY OF PERMIT: 31-Dec-2027
    `;

    const result = service.extractData(DocumentType.PERMIT, samplePermitText);
    expect(result.permitNumber).toBe('KA2022PER1234');
    expect(result.permitExpiryDate).toBe('2027/12/31');
    expect(result.isPermitNumberValid).toBe(true);
  });

  it('should extract Fitness document fields correctly', () => {
    const sampleFitnessText = `
      CERTIFICATE OF FITNESS
      FITNESS VALID UPTO 04-Feb-2028
      INSPECTOR NAME: JOHN DOE
    `;

    const result = service.extractData(DocumentType.FITNESS, sampleFitnessText);
    expect(result.fitnessExpiryDate).toBe('2028/02/04');
  });
});

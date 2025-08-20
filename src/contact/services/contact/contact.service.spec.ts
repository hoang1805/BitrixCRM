import { Test, TestingModule } from '@nestjs/testing';
import { ContactService } from './contact.service';
import { AuthService } from 'src/auth/auth.service';
import { CommonModule } from 'src/common/common.module';
import { AuthModule } from 'src/auth/auth.module';
import { ContactModule } from 'src/contact/contact.module';
import { ConfigModule } from '@nestjs/config';
import { AppModule } from 'src/app.module';

describe('ContactService (Integration)', () => {
  let service: ContactService;
  let authService: AuthService;

  let createdContactId: number | null = null;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    service = module.get<ContactService>(ContactService);
    authService = module.get<AuthService>(AuthService);

    const token = await authService.getAccessToken();
    expect(token).toBeDefined(); // phải ra token hợp lệ
  });

  it('should fetch contacts from Bitrix24', async () => {
    const contacts = await service.getContacts();
    expect(Array.isArray(contacts)).toBe(true);
    console.log('✅ Retrieved contacts:', contacts.length);
  });

  it('should create a contact in Bitrix24', async () => {
    const contactId = await service.createContact({
      firstName: 'Integration',
      lastName: 'Test',
      phone: [{ value: '0123456789', type: 'WORK', deleted: false }],
      email: [{ value: 'integration@test.com', type: 'WORK', deleted: false }],
      website: [],
    });

    expect(typeof contactId).toBe('number');
    createdContactId = contactId;
    console.log('✅ Contact created with ID:', createdContactId);
  });

  afterAll(async () => {
    if (createdContactId) {
      try {
        // giả sử bạn có hàm deleteContact trong service
        await service.deleteById(createdContactId);
        console.log('🗑️ Deleted contact with ID:', createdContactId);
      } catch (err) {
        console.warn('⚠️ Failed to delete contact:', err.message);
      }
    }
  });
});

import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Arabic Encoding Verification', () => {
  it('should check src/locales/ar.json or migration files for correct UTF-8 Arabic', () => {
    const localePath = path.resolve(process.cwd(), 'src/locales/ar.json');
    if (fs.existsSync(localePath)) {
      const content = fs.readFileSync(localePath, 'utf8');
      const presentationForms = content.match(/[ﹰ-﻿]/g) || [];
      expect(presentationForms.length).toBe(0);

      const arabicChars = content.match(/[؀-ۿ]/g) || [];
      expect(arabicChars.length).toBeGreaterThan(0);
    }

    const migrationPath = path.resolve(process.cwd(), 'supabase/migrations/0021_settings_seed.sql');
    if (fs.existsSync(migrationPath)) {
      const content = fs.readFileSync(migrationPath, 'utf8');
      const presentationForms = content.match(/[ﹰ-﻿]/g) || [];
      expect(presentationForms.length).toBe(0);

      const arabicChars = content.match(/[؀-ۿ]/g) || [];
      expect(arabicChars.length).toBeGreaterThan(0);
    }
  });
});

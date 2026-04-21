import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

vi.mock('../components/CSRFToken', () => ({
  default: () => null,
}));

expect.extend(matchers);

afterEach(() => {
  cleanup();
});
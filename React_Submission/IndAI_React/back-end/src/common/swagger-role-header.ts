import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

// Kept under the original helper name so existing controllers do not need a
// cosmetic rewrite. Protected APIs now use Authorization: Bearer <JWT>.
export const ApiRoleHeader = () => applyDecorators(
  ApiBearerAuth('JWT'),
  ApiResponse({ status: 401, description: 'Unauthorized: missing, invalid or expired JWT' }),
  ApiResponse({ status: 403, description: 'Forbidden: authenticated role does not have permission' }),
);

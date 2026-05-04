import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { DataStore } from '../../store/data.store';
import { normalizeRole } from '../../common/roles.decorator';
import { LoginDto } from './dto';

@Injectable()
export class AuthService {
  constructor(private readonly db: DataStore) {}

  login(dto: LoginDto) {
    const user = this.db.findUserByEmail(dto.email);
    if (!user || user.password !== dto.password) {
      throw new UnauthorizedException('Invalid email or password.');
    }
    if (user.status === 'pending') throw new UnauthorizedException('Account is pending approval.');
    if (user.status === 'suspended' || user.status === 'disabled') throw new UnauthorizedException('Account is not active.');

    const requestedRole = normalizeRole(dto.role);
    if (requestedRole && requestedRole !== user.role) {
      throw new BadRequestException(`These credentials belong to a '${user.role}' account. Select the correct role.`);
    }

    return {
      user: this.db.safeUser(user),
      session: { userId: user.id, role: user.role, email: user.email, loginAt: new Date().toISOString() },
    };
  }

  me(userId: string) {
    const user = this.db.getUser(userId);
    if (!user) throw new BadRequestException('User not found.');
    return this.db.safeUser(user);
  }
}

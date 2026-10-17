import { BadRequestException, Controller, Get, NotFoundException, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { DataStore } from '../../store/data.store';
import { Roles } from '../../common/roles.decorator';
import { ApiRoleHeader } from '../../common/swagger-role-header';

@ApiTags('Superuser')
@Controller('superuser')
@ApiRoleHeader()
export class SuperuserController {
  constructor(private readonly db: DataStore) {}

  @Get('overview')
  @Roles('superuser')
  @ApiOperation({ summary: 'Super Admin system overview' })
  overview() {
    return { success: true, data: { users: this.db.users.length, courses: this.db.courses.length, trades: this.db.trades.length, notifications: this.db.notifications.length } };
  }

  @Get('all-data')
  @Roles('superuser')
  @ApiOperation({ summary: 'Super Admin full in-memory repository snapshot' })
  allData() {
    const users = this.db.users.map(u => this.db.safeUser(u));
    return { success: true, data: { ...this.db, users } };
  }

  @Get('audit-logs')
  @Roles('superuser')
  @ApiOperation({ summary: 'Super Admin audit log for administrative, payment and revenue actions' })
  audit() {
    return { success: true, data: this.db.auditLogs.slice().reverse().slice(0, 200) };
  }

  @Get('pending-approvals')
  @Roles('superuser')
  @ApiOperation({ summary: 'List pending Instructor, Course Provider, User Admin and Payment Admin account requests' })
  pendingApprovals() {
    const pending = this.db.users
      .filter(u => u.status === 'pending' && ['instructor', 'provider', 'admin'].includes(u.role))
      .map(u => this.db.safeUser(u));
    return { success: true, data: pending };
  }

  @Post('approvals/:userId/approve')
  @Roles('superuser')
  @ApiOperation({ summary: 'Approve a pending account request. Admin requests keep their selected division.' })
  approve(@Param('userId') userId: string) {
    const user = this.db.getUser(userId);
    if (!user) throw new NotFoundException('Pending account request not found.');
    if (user.role === 'superuser') throw new BadRequestException('The protected Super Admin account is not part of the approval workflow.');
    if (!['instructor', 'provider', 'admin'].includes(user.role)) throw new BadRequestException('This account type does not require Super Admin approval.');
    if (user.status !== 'pending') throw new BadRequestException('This account request is no longer pending.');
    if (user.role === 'admin' && !['USER_ADMIN', 'PAYMENT_ADMIN'].includes(String(user.adminTeam || ''))) {
      throw new BadRequestException('Admin request does not have a valid division.');
    }
    user.status = 'active';
    const now = new Date().toISOString();
    user.approvedAt = now;
    this.db.notifications.push({ id: this.db.id('n'), userId: user.id, message: `Your ${user.role === 'admin' ? (user.adminTeam === 'PAYMENT_ADMIN' ? 'Payment Admin' : 'User Admin') : user.role} account has been approved by the Super Admin.`, type: 'success', read: false, createdAt: now });
    this.db.audit('ACCOUNT_APPROVED', 'u1', { targetUserId: user.id, role: user.role, adminTeam: user.adminTeam || null });
    return { success: true, data: this.db.safeUser(user) };
  }

  @Post('approvals/:userId/reject')
  @Roles('superuser')
  @ApiOperation({ summary: 'Reject and remove a pending account request' })
  reject(@Param('userId') userId: string) {
    const idx = this.db.users.findIndex(u => u.id === userId);
    if (idx < 0) throw new NotFoundException('Pending account request not found.');
    const user = this.db.users[idx];
    if (user.role === 'superuser') throw new BadRequestException('The protected Super Admin account cannot be rejected or removed.');
    if (!['instructor', 'provider', 'admin'].includes(user.role) || user.status !== 'pending') throw new BadRequestException('This account request is no longer pending.');
    this.db.users.splice(idx, 1);
    this.db.audit('ACCOUNT_REJECTED', 'u1', { targetUserId: user.id, email: user.email, role: user.role, adminTeam: user.adminTeam || null });
    return { success: true, data: { id: userId, email: user.email, role: user.role, adminTeam: user.adminTeam || null } };
  }

  @Post('reset-demo-data')
  @Roles('superuser')
  @ApiOperation({ summary: 'Reset demo data by restarting in-memory seed' })
  reset() {
    this.db.onModuleInit();
    return { success: true, message: 'Demo data reset' };
  }
}
